'use strict';

const Util = require('util');
const Boom = require('@hapi/boom');
const Bounce = require('@hapi/bounce');
const Jwt = require('@hapi/jwt');
const Schmervice = require('@hapipal/schmervice');
const { UniqueViolationError } = require('objection');

module.exports = class RobotService extends Schmervice.Service {

    constructor(...args) {

        super(...args);
    }

    async findById(id, txn) {

        const { Robot } = this.server.models();

        var robot = await Robot.query(txn).throwIfNotFound().findById(id);

        robot.scope = robot.scope.split(',');
        return robot;
    }

    async findByRobotname(robotname, txn) {

        const { Robot } = this.server.models();

        var robot = await Robot.query(txn).throwIfNotFound().first().where({ robotname });

        robot.scope = robot.scope.split(',');
        return robot;
    }

    createToken(id) {

        return Jwt.token.generate(JSON.stringify({robot: {id}}), {
            key: this.options.jwtKey,
            algorithm: 'HS256'
        }, {
            ttlSec: 7 * 24 * 60 * 60 // 7 days
        });
    }
};
