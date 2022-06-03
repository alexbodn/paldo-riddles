'use strict';

const Util = require('util');
const Boom = require('@hapi/boom');
const Bounce = require('@hapi/bounce');
const Jwt = require('@hapi/jwt');
const Schmervice = require('@hapipal/schmervice');
const { UniqueViolationError } = require('objection');
const SecurePassword = require('secure-password');

module.exports = class RobotService extends Schmervice.Service {

    constructor(...args) {

        super(...args);

        const pwd = new SecurePassword();

        this.pwd = {
            hash: Util.promisify(pwd.hash.bind(pwd)),
            verify: Util.promisify(pwd.verify.bind(pwd))
        };
    }

    readRobot(robot, raw) {
        if (raw) {
          return robot;
        }
        if (robot) {
          let { scope, ...robotInfo } = robot;
          robotInfo.scope = scope.split(',');
          if ('headers' in robotInfo) {
            robotInfo.headers = JSON.parse(robotInfo.headers);
          }
          return robotInfo;
        }
        return robot;
    }

    async findById(id, txn) {

        const { Robot } = this.server.models();

        var robot = await Robot.query(txn).throwIfNotFound().findById(id);

        return this.readRobot(robot);
    }

    async findByRobotname(robotname, txn) {

        const { Robot } = this.server.models();

        let robot = await Robot.query(txn).throwIfNotFound().first().where({ robotname });

        return this.readRobot(robot);
    }

    async listRobots(dbcols, txn) {
        
        const { Robot } = this.server.models();

        let robots = await Robot.query(txn).select([...dbcols, 'id']);
        if (dbcols.includes('scope')) {
          robots = robots.map(robot => this.readRobot(robot));
        }
        return robots;
    }

    async createToken(id, replaces, txn) {

        const { jwtService } = this.server.services();
        let ttlSec = 77 * 24 * 60 * 60; // 77 days
        let jwt = await jwtService.createToken('robotService', id, ttlSec, replaces, txn);
        return jwt;
    }

    async create({ password, ...robotInfo }, txn) {

        const { Robot } = this.server.models();
        
        robotInfo.password = await this.pwd.hash(Buffer.from(password));

        const { id } = await Robot.query(txn).insert(robotInfo);

        return id;
    }

    async update(id, { password, ...robotInfo }, txn) {

        const { Robot } = this.server.models();
        
        robotInfo.password = await this.pwd.hash(Buffer.from(password));

        await Robot.query(txn).throwIfNotFound().where({ id }).patch(robotInfo);

        return id;
    }

    async delete(id, txn) {

        const { Robot } = this.server.models();
        
        await Robot.query(txn).throwIfNotFound().where({ id }).delete();

        return id;
    }

    async changePassword(id, password, txn) {

        const { Robot } = this.server.models();

        await Robot.query(txn).throwIfNotFound().where({ id }).patch({
            password: await this.pwd.hash(Buffer.from(password))
        });

        return id;
    }
    
};
