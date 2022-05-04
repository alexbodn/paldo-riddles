
module.export = (server, options) => {
  console.log('server state: token', options)
  return ({
  name: 'token',
  options: options.cookie_options,
});
};
