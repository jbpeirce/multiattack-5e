'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    // Add options here
    autoImport: {
      webpack: {
        resolve: {
          fallback: {
            timers: require.resolve('timers-browserify'),
            util: require.resolve('util/'),
          },
        },
      },
    },
  });

  return app.toTree();
}
