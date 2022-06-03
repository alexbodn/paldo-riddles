'use strict';

const Util = require('util');
const Boom = require('@hapi/boom');
const Bounce = require('@hapi/bounce');
const Jwt = require('@hapi/jwt');
const Schmervice = require('@hapipal/schmervice');
const { UniqueViolationError } = require('objection');
const SecurePassword = require('secure-password');

module.exports = class UserService extends Schmervice.Service {

    constructor(...args) {

        super(...args);

        const pwd = new SecurePassword();

        this.pwd = {
            hash: Util.promisify(pwd.hash.bind(pwd)),
            verify: Util.promisify(pwd.verify.bind(pwd))
        };
    }
    
    readUser(user, raw) {
        if (raw) {
          return user;
        }
        if (user) {
          let { password, scope, ...userInfo } = user;
          userInfo.scope = scope.split(',');
          return userInfo;
        }
        return user;
    }

    async findById(id, txn, raw) {

        const { User } = this.server.models();

        var user = await User.query(txn).throwIfNotFound().findById(id);

        return this.readUser(user, raw);
    }

    async findByUsername(username, txn) {

        const { User } = this.server.models();

        var user = await User.query(txn).throwIfNotFound().first().where({ username });

        return this.readUser(user);
    }

    async findByEmail(email, txn) {

        const { User } = this.server.models();

        var user = await User.query(txn).throwIfNotFound().first().where({ email });

        return this.readUser(user);
    }

    async follow(currentUserId, id, txn) {

        const { User } = this.server.models();

        if (currentUserId === id) {
            throw Boom.forbidden();
        }

        try {
            await User.relatedQuery('following', txn).for(currentUserId).relate(id);
        }
        catch (err) {
            Bounce.ignore(err, UniqueViolationError);
        }
    }

    async unfollow(currentUserId, id, txn) {

        const { User } = this.server.models();

        if (currentUserId === id) {
            throw Boom.forbidden();
        }

        await User.relatedQuery('following', txn).for(currentUserId)
            .unrelate().where({ id });
    }

    async signup({ password, ...userInfo }, txn) {

        const { User } = this.server.models();

        const { id } = await User.query(txn).insert(userInfo);

        await this.changePassword(id, password, txn);

        return id;
    }

    async update(id, { password, password_current, ...userInfo }, txn) {

        const { User } = this.server.models();

        if (password) {
            const user = await this.findById(id, txn, true);
            await this.passwordCheck(password_current, user, txn);
        }

        await User.query(txn).throwIfNotFound().where({ id }).patch(userInfo);

        if (password) {
            await this.changePassword(id, password, txn);
        }

        return id;
    }

    async login({ email, password }, txn, response) {

        const { User } = this.server.models();
        const { jwtService } = this.server.services();

        const user = await User.query(txn).throwIfNotFound().first().where({
            email: User.raw('? collate nocase', email)
        });

        await this.passwordCheck(password, user, txn);

        let token = await this.createToken(user.id, null, txn);
        //response.headers.authorization = 'Token '+state_token;
        response.unstate("token");
        response.state("token", token);
        console.log('app state set in login to:', token)
        token = jwtService.setPrefix(token);
        response.request.app.authorization = token;
        // to redirect
        response.header('authorization', token);

        return response;
    }
    
    async logout(txn, response) {

        let resp_auth = response.request.headers.authorization;
        if (resp_auth) {
            const { jwtService } = this.server.services();
            console.log('token to parse:', resp_auth)
            const payload = jwtService.parseToken(resp_auth);
            if (payload) {
                await jwtService.revoke(payload.id, txn);
            }
        }
        // to redirect
        response.unstate("token");
        console.log('++++++ unstate token');
        response.header('authorization', null);

        return response;
    }

    async passwordCheck(password, user, txn)
    {
        const { User } = this.server.models();

        const pCheck = await this.pwd.verify(Buffer.from(password), user.password);

        if (pCheck === SecurePassword.VALID_NEEDS_REHASH) {
            await this.changePassword(user.id, password, txn);
        }
        else if (pCheck !== SecurePassword.VALID) {
            throw Boom.forbidden('Incorrect password');
        }
        return pCheck;
    }

    async createToken(id, replaces, txn) {

        const { jwtService } = this.server.services();
        let ttlSec = 7 * 24 * 60 * 60; // 7 days
        let jwt = await jwtService.createToken('userService', id, ttlSec, replaces, txn);
        return jwt;
    }

    async changePassword(id, password, txn) {

        const { User } = this.server.models();

        await User.query(txn).throwIfNotFound().where({ id }).patch({
            password: await this.pwd.hash(Buffer.from(password))
        });

        return id;
    }
    
};
