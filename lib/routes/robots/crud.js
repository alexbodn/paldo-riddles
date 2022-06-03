'use strict';

const Joi = require('joi');
const Boom = require('@hapi/boom');
const Helpers = require('../helpers');
const Robot = require('../../models/robot');

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
        path: "/robots",
        options: {
            handler: async (request, h) => {
              const { robotService } = request.services();

              let dbcols = ['username', 'url', 'scope'];
              const getList = async (txn) => {
                let robots = await robotService.listRobots(
                    ['id'].concat(dbcols), txn);
                let confirm_delete = () => {return confirm('sure to delete?');};
                robots = robots.map((robot) => {
                  robot.actions = [
                    {tag: 'a', href: `/robots/edit/${robot.id}`, text: 'edit'},
                    '&nbsp;',
                    {
                      tag: 'a',
                      href: `/robots/delete/${robot.id}`,
                      text: 'delete',
                      onclick: `javascript:return (${confirm_delete})();`,
                    },
                  ].concat(Robot.scopes_actions(robot.scope).map(action => {
                    action.href = format(action.href, robot);
                    return action;
                  }));
                  return robot;
                });
                return robots;
              }
              let robots = await h.context.transaction(getList);

              let data = {
                __rows: robots.concat({
                  actions: {tag: 'a', href: '/robots/new', text: 'new'}}),
                __columns: [ ...dbcols, 'actions'],
                //__columns: false,
                __td_style: 'border: thin solid;',
                __th_style: 'border: thin solid;',
                style: 'border-collapse: collapse;',
              };

              return h.view('table', {
                  title: 'robots',
                  data: data,
              });
            },
        },
    },
    {
        method: "get",
        path: "/robots/new",
        options: {
            handler: async (request, h) => {
                var fields = Robot.editFields();
                
                const form = {
                  action: '/robots/robot', method: 'POST', __fields: fields,
                };
                
                return h.view('user', {
                    title: 'new robot', form: form,
                });
            }
        }
    },
    {
        method: 'post',
        path: "/robots/robot",
        options: {
            validate: {
                payload: Joi.object(Object.assign({},
                    Robot.joiFields,
                    Robot.joiPasswordWeb,
                  ))
                  .options({ stripUnknown: true }),
                failAction: (request, h, error) => {
                    return h.response(error.isJoi ? error.details[0] : error).takeover();
                },
            },
            handler: async (request, h) => {

                const { robotService } = request.services();

                const robotInfo = request.payload;

                const createAndFetchRobot = async (txn) => {
                  try {
                    return await robotService.create(robotInfo, txn);
                  }
                  catch (error) {
                    throw Boom.badData(error);
                  }
                };

                const response = h.response();
                
                await h.context.transaction(createAndFetchRobot);

                response.redirect('/robots');
                
                return response;
            }
        }
    },
    {
        method: "get",
        path: "/robots/edit/{id}",
        options: {
            validate: {
              params: Joi.object({
                id: Joi.number().integer().min(1)
              }),
            },
            handler: async (request, h) => {
              const { robotService } = request.services();

              var fields = Robot.editFields();
              
              const robotId = request.params.id;
  
              const fetchRobot = async (txn) => {
  
                return await robotService.findById(robotId, txn);
              };
  
              const robot = await h.context.transaction(fetchRobot);
  
              let session = request.state.session;
              let formError = session.formError || {};
              const private_fields = ['password', 'id'];
              for (var [key, val] of Object.entries(robot)) {
                if (private_fields.includes(key)) {
                  continue;
                }
                fields[key].__val = val;
                if (key in formError) {
                  fields[key].__val = formError[key].value;
                  fields[key].__errmsg = formError[key].message;
                }
              }
              const form = {
                action: `/robots/robot/${robotId}`, method: 'POST', __fields: fields,
              };
              
              return h.view('user', {
                title: 'update', form: form,
              });
            }
        }
    },
    {
        method: "post",
        path: "/robots/robot/{id}",
        options: {
            validate: {
                payload: Joi.object(Object.assign({},
                    Robot.joiFields,
                    Robot.joiPasswordWeb,
                  )),
                params: Joi.object({
                  id: Joi.number().integer().min(1)
                }),
                options: {
                  stripUnknown: true,
                  abortEarly: false,
                },
                failAction: (request, h, error) => {
                  let session = request.state.session;
                  if (!session) {
                    session = {};
                  }
                  if (error.isJoi) {
                    session.formError = error.details.reduce((acc, curr) => {
                      acc[curr.context.key] = {
                        message: curr.message,
                        value: curr.context.value,
                      };
                      return acc;
                    }, {});
                  }
                  else {
                    session.flashMessage = 'there was an error in your form';
                  }

                  const robotId = request.params.id;
                  let target = `/robots/edit/${robotId}`;
                  return h.redirect(target).state('session', session).takeover();
                },
            },
            handler: async (request, h) => {
                const robotInfo = request.payload;
                const { robotService } = request.services();
                const robotId = request.params.id;
    
                const updateRobot = async (txn) => {
                    return await robotService.update(robotId, robotInfo, txn);
                };
    
                await h.context.transaction(updateRobot);
    
                return h.redirect('/robots');
            },
        }
    },
    {
        method: "get" /*"delete"*/,
        path: "/robots/delete/{id}",
        options: {
            validate: {
                failAction: (request, h, error) => {
                    return h.response(error.isJoi ? error.details[0] : error).takeover();
                },
            },
            handler: async (request, h) => {
                const { robotService } = request.services();
                const robotId = request.params.id;
    
                const deleteRobot = async (txn) => {
                    return await robotService.delete(robotId, txn);
                };
    
                await h.context.transaction(deleteRobot);
    
                return h.redirect('/robots');
            },
        }
    },
].map(route => {
  route.options.auth = {
    scope: [
      'admin'
    ],
  };
  return route;
}));
