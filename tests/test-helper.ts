import { setApplication } from '@ember/test-helpers';
import { setupEmberOnerrorValidation, start } from 'ember-qunit';
import { loadTests } from 'ember-qunit/test-loader';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';

import Application from 'multiattack-5e/app';
import config from 'multiattack-5e/config/environment';

setApplication(Application.create(config.APP));

setup(QUnit.assert);

setupEmberOnerrorValidation();
loadTests();
start();
