'use strict';

const Joi = require('joi');
const { Model } = require('./helpers');
const utcRe = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})UTC$/;
const isoFormat = '$1-$2-$3 $4:$5:$6.000Z';

module.exports = class SMS extends Model {

    static tableName = 'smses';

    static joiSchema = Joi.object({
        TimeSent: Joi.string().replace(utcRe, isoFormat).isoDate(),
        TimeReceived: Joi.string().replace(utcRe, isoFormat).isoDate(),
        SmsSid: Joi.string(),
        SmsStatus: Joi.string(),
        NumSegments: Joi.string(),
        From: Joi.string(),
        AccountSid: Joi.string(),
        To: Joi.string(),
        Body: Joi.string(),
        NumMedia: Joi.string(),
        Pinned: Joi.number().allow(0, 1),
        Starred: Joi.number().allow(0, 1),
        Trashed: Joi.number().allow(0, 1),
    });
};

var example = {
    "TimeSent":"20220318T202201UTC",
    "TimeReceived":"20220318T202201UTC",
    "SmsSid":"SM53263d7713cfd391b84fbc738dbebb46",
    "SmsStatus":"received",
    "NumSegments":"1",
    "From":"+972515010718",
    "AccountSid":"AC53d39b824a6964d2db70a2c71ded1a65",
    "To":"+14094055673",
    "Body":"שוב",
    "NumMedia":"0"
};
