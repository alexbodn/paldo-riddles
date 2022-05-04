'use strict';

const Joi = require('joi');
const Helpers = require('../helpers');
const Robot = require('../../models/robot');

module.exports = Helpers.withDefaults([
    {
        method: "get",
        path: "/robots",
        options: {
            handler: (request, h) => {
                return h.redirect('/robots/crud');
            },
        },
    },
    {
        method: "get",
        path: "/robots/crud",
        options: {
            handler: (request, h) => {
                return "list of robots";
            },
        },
    },
    {
        method: "get",
        path: "/robots/crud/robot",
        options: {
            handler: async (request, h) => {
            const { userService, displayService } = request.services();
            const scopes_info = userService.scopes_info();

                var fields = {
                    url: {tag: 'input', type: 'url'},
                    password: {tag: 'input', type: 'password'},
                    password_confirm: {tag: 'input', type: 'password'},
                    password_current: {
                      tag: 'input', type: 'password'},
                    username: {tag: 'input', type: 'text'},
                    info: {tag: 'textarea'},
                    scope: {tag: 'input', type: 'radio', options: Object.keys(scopes_info), multiple: true},
                    autho_refresh: {tag: 'input', type: 'number'},
                };

                for (var [key, val] of Object.entries(fields)) {
                    val.__label = {__label: key + ': ', __class: 'field_label'};
                    val.name = key;
                }
                return h.view('user', {
                    title: 'new robot', action: '/robots/crud/robot', method: 'POST',
                    fields: fields
                });
            }
        }
    },
    {
        method: 'post',
        path: "/robots/crud/robot",
        options: {
            validate: {
                payload: Robot.joiSchema,
                failAction: (request, h, error) => {
                    return h.response(error.isJoi ? error.details[0] : error).takeover();
                },
            },
            handler: async (request, h) => {

                const { robotService, userService } = request.services();
                const scopes_info = userService.scopes_info();
                
                const robotInfo = request.payload;

                const createAndFetchRobot = async (txn) => {

                    const id = await robotService.createnew(robotInfo, txn);

                    return await robotService.findById(id, txn);
                };

                const robot = await h.context.transaction(createAndFetchRobot);

                response.redirect('/robots/crud');
                return response;
            }
        }
    },
    {
        method: "get",
        path: "/robots/crud/robot/{id}",
        options: {
            handler: async (request, h) => {
    
                const { robotService, userService } = request.services();
                const scopes_info = userService.scopes_info();
                
                var fields = {
                    url: {tag: 'input', type: 'urll'},
                    password: {tag: 'input', type: 'password'},
                    password_confirm: {tag: 'input', type: 'password'},
                    password_current: {
                      tag: 'input', type: 'password'},
                    username: {tag: 'input', type: 'text'},
                    info: {tag: 'textarea'},
                    scope: {tag: 'input', type: 'radio', options: Object.keys(scopes_info), multiple: true},
                    autho_refresh: {tag: 'input', type: 'number'},
                };
                
                const robotId = request.params.id;
    
                const fetchRobot = async (txn) => {
    
                    return await robotService.findById(robotId, txn);
                };
    
                const robot = await h.context.transaction(fetchRobot);
    
                const private_fields = ['password', 'id'];
                for (var [key, val] of Object.entries(robot)) {
                    if (private_fields.includes(key)) {
                      continue;
                    }
                    fields[key].__val = val;
                }
                for (var [key, val] of Object.entries(fields)) {
                    val.__label = {__label: key + ': ', __class: 'field_label'};
                    val.name = key;
                }
    
                return h.view('user', {
                    title: 'update', action: `/robots/crud/robot/${robotId}`, method: 'POST',
                    fields: fields,
                });
            }
        }
    },
    {
        method: "post",
        path: "/robots/crud/robot/{id}",
        options: {
            validate: {
                payload: Robot.joiSchema,
                failAction: (request, h, error) => {
                    return h.response(error.isJoi ? error.details[0] : error).takeover();
                },
            },
            handler: async (request, h) => {
                const robotInfo = request.payload;
                console.log(robotInfo)
                const { userService, displayService } = request.services();
                const robotId = request.params.id;
    
                const updateRobot = async (txn) => {
                    return await robotService.update(robotId, robotInfo, txn);
                };
    
                await h.context.transaction(updateRobot);
    
                return h.redirect('/robots/crud');
            },
        }
    },
]);
