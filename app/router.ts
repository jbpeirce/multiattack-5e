import EmberRouter from '@ember/routing/router';

import config from 'multiattack-5e/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

// Temporarily disable this check until this file is actually filled out
Router.map(function () {});
