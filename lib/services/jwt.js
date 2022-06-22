'use strict';

//const Util = require('util');
//const Boom = require('@hapi/boom');
//const Bounce = require('@hapi/bounce');
const Jwt = require('@hapi/jwt');
const Schmervice = require('@hapipal/schmervice');
//const { UniqueViolationError } = require('objection');

module.exports = class JwtService extends Schmervice.Service {

    static tokenPrefix = 'Token ';
    
    constructor(...args) {

        super(...args);
    }

    stripPrefix(token) {
      
      let tokenPrefix = JwtService.tokenPrefix;
      if (!token) {
        return '';
      }
      if (token.startsWith(tokenPrefix)) {
        token = token.slice(tokenPrefix.length);
      }
      return token;
    }

    setPrefix(token) {
      
      token = this.stripPrefix(token);
      if (token) {
        token = JwtService.tokenPrefix + token;
      }
      return token;
    }

    async findById(id, txn) {

        const { JWT } = this.server.models();

        var jwt = await JWT.query(txn).throwIfNotFound().findById(id);

        return jwt;
    }

    async createToken(service, owner, ttlSec, replaces, txn) {

        const models = this.server.models();
        const JWT = models.JWT;
        const services = this.server.services();
        const ownerData = await services[service].findById(owner, txn);

        let now = this.tsSecs();
        let exp = now + ttlSec;
        
        let data = {
          service: service,
          owner: owner,
          iat: now,
          exp: exp,
          autho_refresh: ownerData.autho_refresh ? exp - ownerData.autho_refresh : null,
          replaces: replaces,
        };
        const jwt = await JWT.query(txn).insert(data);
        
        const token = Jwt.token.generate(
          {
            id: jwt.id,
            iat: now,
            exp: exp,
          }, {
            key: this.options.jwtKey,
            algorithm: 'HS256'
          }, {}
        );
        
        return token;
    }
    
    parseToken(token) {
        if (!token) {
          return null;
        }
        //console.log('token to parse:', token)
        token = this.stripPrefix(token);
        let jwt = Jwt.token.decode(token, this.options.jwtKey);
        //console.log('decoded payload:', jwt.decoded.payload)
        return jwt.decoded.payload;
    }
    
    async takeover(id, txn) {
        try {
          const jwt = await this.findById(id, txn);
          if (jwt && jwt.replaces) {
            //console.log(`jwt ${JSON.stringify(jwt)} taking over ${jwt.replaces}`)
            const { JWT } = this.server.models();
            await JWT.query(txn).where({id: jwt.id}).patch({replaces: null});
            await this.revoke(jwt.replaces, txn);
          }
          return jwt;
        }
        catch (error) {
          return null;
        }
    }

    async revoke(id, txn) {
        const { JWT } = this.server.models();

        let rvk = this.tsSecs();
        await JWT.query(txn).where({ id: id, rvk: null }).patch({rvk});
    }
    
    tsSecs(ts) {
      return Math.floor((ts || Date.now()) / 1000);
    }
};
