'use strict';

const Joi = require('joi');
const Helpers = require('../helpers');
const SMS = require('../../models/sms');

module.exports = Helpers.withDefaults([
    {
        method: 'post',
        path: '/messages0',
        options: {
            validate: {
                payload: SMS.joiSchema
            },
            handler: async (request, h) => {

                const msgInfo = request.payload;

                const msgsave = async (txn) => {
                    const { id } = await SMS.query(txn).insert(msgInfo);

                    return id;
                };

                const id = await h.context.transaction(msgsave);

                return id;
            }
        }
    },
    {
        method: 'get',
        path: '/messages0',
        options: {
            handler: async (request, h) => {

                const { sms } = request.auth.credentials;

                const listall = async (txn) => {
                    const messages = await SMS.query(txn)
                        .where('From', sms).orWhere('To', sms);

                    return messages;
                };

                const messages = await h.context.transaction(listall);

                return messages;
            }
        }
    },
]);

/*
const {Sequelize, Op} = require('sequelize');
const SMS =  require('../models/sms');

// * List Conversations
exports.conversations = (req, h) => {
  var query = {
    attributes: [
      Sequelize.literal('case when From=\''+global.myNumber+'\' then To else From', 'Peer'),
      [Sequelize.fn('max', Sequelize.col('createdAt')), 'last_created'],
    ],
    where: {
      [Op.or]: [
        {To: global.myNumber},
        {From: global.myNumber},
      ]
    },
    group: 'Peer',
    order: ['last_created', 'DESC'],
  };
  return SMS.findAll(query).then((conversation) => {

    return { conversations: conversation };

  }).catch((err) => {

    return { err: err };

  });
}

// * Get conversation by peer
exports.conversation = (req, h) => {
  
  var query = {
    attributes: [
      'TimeSent', 
      'TimeReceived', 
      'SmsSid', 
      'SmsStatus', 
      'From', 
      'To', 
      'Body',
      ],
    where: {
      [Op.or]: [
        {
          To: req.params.peer,
          From: global.myNumber,
        },
        {
          From: req.params.peer,
          To: global.myNumber,
        },
      ],
    },
    order: ['createdAt', 'ASC'],
  };
  return SMS.findAll(query).then((conversation) => {
    return { conversation: conversation };
  }).catch((err) => {
    return { err: err };
  });
}


// * POST an SMS
exports.create = (req, h) => {

  const dflt = {
    TimeSent:null,
    //TimeReceived:"20220318T202201UTC",
    //SmsSid:"SM53263d7713cfd391b84fbc738dbebb46",
    //SmsStatus:"received",
    NumSegments:"1",
    //From:"+972515010718",
    //To:"+14094055673",
    //Body:"שוב",
    NumMedia:"0",
    Pinned:0,
    Starred:0,
  };
  const required = [
    'TimeReceived', 
    'SmsSid', 
    'SmsStatus', 
    'From', 
    'To', 
    'Body',
  ];
  let data = dflt;
  required.forEach(key => {data[key] = req.payload[key];});

  return SMS.create(data).then((sms) => {
     return { message: "SMS created successfully", sms: sms };
  }).catch((err) => {
    return { err: err };
  });
}

// * PUT | Toggle star by ID
 exports.star = (req, h) => {

  SMS.findByPk(req.params.id).then(toStar => {
  if (toStar !== null) {
    toStar.update({Starred: (3 - toStar.Starred) % 2}).then(result => {
      const un = toStar.Starred ? 'un' : '';
      return { message: `SMS ${un}starred successfully`, result: result };
    }).catch((err) => {
      return { err: err };
    });
  }
  else {
    return {err: 'sms not found'};
  }
  }).catch((err) => {
    return { err: err };
  });
}

// * PUT | Toggle pin by ID
 exports.pin = (req, h) => {

  SMS.findByPk(req.params.id).then (toPin => {
  if (toPin !== null) {
    toPin.update({Pinned: (3 - toPin.Pinned) % 2}).then(result => {
      const un = toPin.Pinned ? 'un' : '';
      return { message: `SMS ${un}pinned successfully`, result: result };
    }).catch((err) => {
      return { err: err };
    });
  }
  else {
    return {err: 'sms not found'};
  }
  }).catch((err) => {
    return { err: err };
  });
}

// * Delete SMS by ID
exports.remove = (req, h) => {
  
  SMS.findByPk(req.params.id).then(toRemove => {
  if (toRemove !== null) {
    toRemove.destroy().then(result => {
      return { message: `SMS removed successfully`, result: result };
    }).catch((err) => {
      return { err: err };
    });
  }
  else {
    return {err: 'sms not found'};
  }
  }).catch((err) => {
    return { err: err };
  });
}
*/