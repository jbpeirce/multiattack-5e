import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import AdvantageState from 'multiattack-5e/components/advantage-state-enum';
import RandomnessService from 'multiattack-5e/services/randomness';
import D20WithAdvantageState from 'multiattack-5e/utils/d20-with-advantage-state';

module('Unit | Utils | d20-with-adv', function (hooks) {
  setupTest(hooks);

  test('it rolls with advantage', async function (assert) {
    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(3);
    fakeD20.onCall(1).returns(7);

    const d20 = new D20WithAdvantageState(
      AdvantageState.ADVANTAGE,
      new RandomnessService(),
    );
    d20.die.roll = fakeD20;

    assert.strictEqual(d20.getD20Roll(), 7, 'die should roll with advantage');
  });

  test('it rolls with disadvantage', async function (assert) {
    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(3);
    fakeD20.onCall(1).returns(7);

    const d20 = new D20WithAdvantageState(
      AdvantageState.DISADVANTAGE,
      new RandomnessService(),
    );
    d20.die.roll = fakeD20;

    assert.strictEqual(
      d20.getD20Roll(),
      3,
      'die should roll with disadvantage',
    );
  });

  test('it rolls a straight roll', async function (assert) {
    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(3);
    fakeD20.onCall(1).returns(7);

    const d20 = new D20WithAdvantageState(
      AdvantageState.STRAIGHT,
      new RandomnessService(),
    );
    d20.die.roll = fakeD20;

    assert.strictEqual(
      d20.getD20Roll(),
      3,
      'die should use the first roll when making straight roll',
    );

    fakeD20.onCall(2).returns(6);
    fakeD20.onCall(3).returns(1);
    assert.strictEqual(
      d20.getD20Roll(),
      6,
      'die should use the first roll again when making straight roll',
    );
  });
});
