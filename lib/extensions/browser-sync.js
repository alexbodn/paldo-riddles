'use strict';

const ChildProcess = require('child_process');
const Util = require('util');

module.exports = [
    {
        type: 'onPostStart',
        method: async (server) => {

            //return;

            if (!server.realm.pluginOptions.developmentMode) {
                return;
            }

            const bs = server.app.bs = require('browser-sync').create('my dev server');
            const base = server.realm.settings.files.relativeTo;
            let chokidar_opts = { // try to insert in watchOptions
              usePolling: true, interval: 2000, binaryInterval: 2000,
              awaitWriteFinish: {stabilityThreshold: 2000, pollInterval: 2000},
            };
            const run = (cmd) => ChildProcess.spawn('npm', ['run', cmd], {stdio: 'inherit'});

            bs.watch(`${base}/public/**/*.scss`, chokidar_opts).on('change', () => run('prebuild:css'));
            bs.watch([`${base}/public/**/*.js`, '!**/*.build.*'], chokidar_opts).on('change', () => run('prebuild:js'));

            bs.watch(`${base}/templates/**/*`, chokidar_opts).on('change', bs.reload);
            bs.watch(`${base}/public/**/*.{build.js,css}`, chokidar_opts).on('change', bs.reload);
            //this is taken care by nodemon
            //bs.watch('/home/alex/nodejs-proj/paldo-ridles', chokidar_opts).on('change', bs.reload);

            let node_local = process.env.NODE_LOCAL.replace(/\/$/, '');

            await Util.promisify(bs.init)({
              proxy: server.info.uri,
              port: 8081,
              serveStatic: [
                {route: '/public', dir: `${base}/public`},
                {route: node_local, dir: node_local},
              ],
              reloadOnRestart: true,
              open: false,
              ghostMode: false,
              ui: false,
              callbacks: {
                ready: (err, bs) => {
                  //console.log('[[[[[[[', Object.keys(bs.logger))
                  bs.events.once('client:connected', () => {
                    bs.events.emit("browser:reload");
                    bs.events.emit(
                      "browser:notify", {message: 'server just started. will reload'});
                  });
                },
              },
            });
        }
    },
    {
        type: 'onPreStop',
        method: (server) => {

            if (!server.app.bs) {
                return;
            }

            server.app.bs.exit();
        }
    }
];
