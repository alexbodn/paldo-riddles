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

    async findById(id, txn) {

        const { User } = this.server.models();

        var user = await User.query(txn).throwIfNotFound().findById(id);

        delete user.password;
        user.scope = user.scope.split(',');
        return user;
    }

    async findByUsername(username, txn) {

        const { User } = this.server.models();

        var user = await User.query(txn).throwIfNotFound().first().where({ username });

        delete user.password;
        user.scope = user.scope.split(',');
        return user;
    }

    async findByEmail(email, txn) {

        const { User } = this.server.models();

        var user = await User.query(txn).throwIfNotFound().first().where({ email });

        delete user.password;
        user.scope = user.scope.split(',');
        return user;
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

        var userInfoC = Object.assign(userInfo);
        delete userInfoC.password_confirm;
        if (Array.isArray(userInfoC.scope)) {
          userInfoC.scope = userInfoC.scope.join(',');
        }
        const { id } = await User.query(txn).insert(userInfoC);

        await this.changePassword(id, password, txn);

        return id;
    }

    async update(id, { password, ...userInfo }, txn) {

        const { User } = this.server.models();

        if (password) {
            const user = await findById(id, txn);
            await passwordCheck(userInfo.password_current, user);
        }

        if (Object.keys(userInfo).length > 0) {
            var userInfoC = Object.assign(userInfo);
            delete userInfoC.password_confirm;
            delete userInfo.password_current;
            if (Array.isArray(userInfoC.scope)) {
              userInfoC.scope = userInfoC.scope.join(',');
            }
            await User.query(txn).throwIfNotFound().where({ id }).patch(userInfoC);
        }

        if (password) {
            await this.changePassword(id, password, txn);
        }

        return id;
    }

    async login({ email, password }, txn, response) {

        const { User } = this.server.models();

        const user = await User.query(txn).throwIfNotFound().first().where({
            email: User.raw('? collate nocase', email)
        });

        await this.passwordCheck(password, user);

        const state_token = this.createToken(user.id);
        response.state("token", state_token, this.options.cookie_options);
        response.headers.authorization = 'Token '+state_token;

        return response;
    }

    async logout(txn, response) {

        response.unstate("token", this.options.cookie_options);
        response.headers.authorization = null;

        return response;
    }

    async passwordCheck(password, user)
    {
        const { User } = this.server.models();

        const pCheck = await this.pwd.verify(Buffer.from(password), user.password);

        if (pCheck === SecurePassword.VALID_NEEDS_REHASH) {
            await this.changePassword(user.id, password, txn);
        }
        else if (pCheck !== SecurePassword.VALID) {
            throw User.createNotFoundError();
        }
        return pCheck;
    }

    createToken(id) {

        return Jwt.token.generate({ id }, {
            key: this.options.jwtKey,
            algorithm: 'HS256'
        }, {
            ttlSec: 7 * 24 * 60 * 60 // 7 days
        });
    }

    parseToken(token) {
        const data = Jwt.token.decode(token, this.options.jwtKey);
        return data.decoded.payload.id;
    }

    async changePassword(id, password, txn) {

        const { User } = this.server.models();

        await User.query(txn).throwIfNotFound().where({ id }).patch({
            password: await this.pwd.hash(Buffer.from(password))
        });

        return id;
    }
    
    scopes_info() {
      const info = {
        client: {
          menu_options: [
            {href: '/current', text: 'current'},
            {href: '/logout', text: 'logout'},
            {href: '/messages', text: 'messages'},
          ],
        },
        guest: {
          menu_options: [
            {href: '/signup', text: 'signup'},
            {href: '/login', text: 'login'},
          ],
        },
        admin: {
          menu_options: [
            {href: '/robots', text: 'robots'},
          ],
        },
      };
      
      return info;
    }
};
