import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import AdvantageState from 'multiattack-5e/components/advantage-state-enum';
import RandomnessService from 'multiattack-5e/services/randomness';
import D20WithModifiers from 'multiattack-5e/utils/d20-with-modifiers';

module('Unit | Utils | d20-with-adv', function (hooks) {
  setupTest(hooks);

  test('it rolls with advantage', async function (assert) {
    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(3);
    fakeD20.onCall(1).returns(7);

    const d20 = new D20WithModifiers(
      AdvantageState.ADVANTAGE,
      '4',
      new RandomnessService(),
    );
    d20.die.roll = fakeD20;

    assert.strictEqual(d20.getD20Roll(), 7, 'die should roll with advantage');
  });

  test('it rolls with disadvantage', async function (assert) {
    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(3);
    fakeD20.onCall(1).returns(7);

    const d20 = new D20WithModifiers(
      AdvantageState.DISADVANTAGE,
      '1',
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

    const d20 = new D20WithModifiers(
      AdvantageState.STRAIGHT,
      '1d6',
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

  test('it handles a positive constant modifier', async function (assert) {
    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(3);
    fakeD20.onCall(1).returns(7);

    const d20 = new D20WithModifiers(
      AdvantageState.STRAIGHT,
      '7',
      new RandomnessService(),
    );
    d20.die.roll = fakeD20;

    assert.deepEqual(
      d20.roll(),
      {
        total: 10,
        baseD20Roll: 3,
        rolls: [
          {
            name: '1d20',
            rolls: [3],
          },
        ],
      },
      'die should add a constant modifier to the d20 roll',
    );
  });

  test('it handles a negative constant modifier', async function (assert) {
    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(3);
    fakeD20.onCall(1).returns(7);

    const d20 = new D20WithModifiers(
      AdvantageState.STRAIGHT,
      '-1',
      new RandomnessService(),
    );
    d20.die.roll = fakeD20;

    assert.deepEqual(
      d20.roll(),
      {
        total: 2,
        baseD20Roll: 3,
        rolls: [
          {
            name: '1d20',
            rolls: [3],
          },
        ],
      },
      'die should subtract a negative constant modifier from the d20 roll',
    );
  });

  test('it handles a modifier including dice', async function (assert) {
    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(3);
    fakeD20.onCall(1).returns(7);

    const fakeD4 = sinon.stub();
    fakeD4.onCall(0).returns(2);

    const d20 = new D20WithModifiers(
      AdvantageState.STRAIGHT,
      '1d4 + 1',
      new RandomnessService(),
    );
    d20.die.roll = fakeD20;
    const mod1d4 = d20.modifier.diceGroups[0]?.die;
    if (mod1d4) {
      mod1d4.roll = fakeD4;
    }

    assert.deepEqual(
      d20.roll(),
      {
        total: 6,
        baseD20Roll: 3,
        rolls: [
          {
            name: '1d20',
            rolls: [3],
          },
          {
            name: '1d4',
            rolls: [2],
          },
        ],
      },
      'die should add a dice and a constant modifier to the d20 roll',
    );
  });

  test('it handles a complex modifier', async function (assert) {
    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(10);
    fakeD20.onCall(1).returns(7);

    const fakeD4 = sinon.stub();
    fakeD4.onCall(0).returns(2);

    const fakeD6 = sinon.stub();
    fakeD6.onCall(0).returns(1);
    fakeD6.onCall(1).returns(4);

    const d20 = new D20WithModifiers(
      AdvantageState.STRAIGHT,
      '-1d4 + 1 + 2d6 - 3',
      new RandomnessService(),
    );
    d20.die.roll = fakeD20;

    const mod1d4 = d20.modifier.diceGroups[0]?.die;
    if (mod1d4) {
      mod1d4.roll = fakeD4;
    }

    const mod1d6 = d20.modifier.diceGroups[1]?.die;
    if (mod1d6) {
      mod1d6.roll = fakeD6;
    }

    assert.deepEqual(
      d20.roll(),
      {
        total: 11,
        baseD20Roll: 10,
        rolls: [
          {
            name: '1d20',
            rolls: [10],
          },
          {
            name: '-1d4',
            rolls: [2],
          },
          {
            name: '2d6',
            rolls: [1, 4],
          },
        ],
      },
      'die should add both constants and dice-group modifiers to the d20 roll',
    );
  });
});
