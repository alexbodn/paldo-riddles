'use strict';

const Joi = require('joi');
const Boom = require('@hapi/boom');
const Helpers = require('../helpers');
const Robot = require('../../models/robot');

const {jsonSend} = require('websend');

function format(template, variables) {
  return template.replace(
    /\{(.*?)\}/g,
    match => {
      match = match.slice(1, match.length-1);
      return variables[match.trim()];
    }
  );
}

module.exports = Helpers.withDefaults([
  {
    method: "get",
    path: "/robots/jwt_give/{id}",
    options: {
      handler: async (request, h) => {
        const { robotService } = request.services();
        const robotId = request.params.id;
        console.log(robotId);
        const getInfo = async (txn) => {
          let info = await robotService.findById(robotId, txn);
          info.jwt = await robotService.createToken(robotId, null, txn);
          return info;
        }
        let info = await h.context.transaction(getInfo);
        const url = format(info.url, info);
        //take a sending module from the client
        console.log('got info:', info)
        let target = new URL(url);
        const data = {
            jwt: info.jwt
        };
        const headers = Object.entries(info.headers || {}).reduce((acc, curr) => {
          acc[curr[0]] = curr[1];
          return acc;
        }, {});
        if (`${target.hostname}:${target.port}` == request.info.host) {
          headers.Authorization = request.headers.authorization;
        }
        const options = {
          hostname: target.hostname,
          port: target.port,
          path: target.pathname,
          method: 'POST',
        };
        const scheme = require(target.protocol.replace(':', ''));
        console.log(target)
        jsonSend(scheme, options, data, headers)
          .then(res => {
            console.log(`JWT send success ${res}`);
          })
          .catch(err => {
            console.log(`JWT send error ${err}`)
        });
        return h.redirect('/robots');
      },
    },
  },
  {
    method: "post",
    path: "/robots/jwt_recv/{id}",
    options: {
      handler: async (request, h) => {
        const data = request.payload;
        return {
          'received data': data,
          'headers': request.headers,
        };
      },
    },
  },
]);