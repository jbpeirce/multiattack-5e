import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import RandomnessService from 'multiattack-5e/services/randomness';
import { stubReturning } from 'multiattack-5e/tests/helpers/dice-helper';
import DiceGroup from 'multiattack-5e/utils/dice-group';

module('Unit | Utils | dice-group', function (hooks) {
  setupTest(hooks);

  test('it rejects invalid input values', async function (assert) {
    assert.throws(
      () => new DiceGroup(-1, 6, new RandomnessService()),
      new Error('Number of dice in group must be non-negative'),
      'negative number of dice should throw an error',
    );
    assert.throws(
      () => new DiceGroup(4, -1, new RandomnessService()),
      new Error('Die must have a positive number of sides'),
      'negative number of sides for dice should throw an error',
    );
  });

  test('it rolls and totals multiple dice', async function (assert) {
    const noDice = new DiceGroup(0, 6, new RandomnessService());
    assert.deepEqual(
      noDice.roll(),
      {
        total: 0,
        rolls: [],
      },
      'rolling no dice should never result in a total',
    );

    // Create a group with a single die and mock its roll
    const group1d8 = new DiceGroup(1, 8, new RandomnessService());
    assert.strictEqual(
      group1d8.numDice,
      1,
      'group should have expected number of dice',
    );
    assert.strictEqual(
      group1d8.die.sides,
      8,
      "group's die should have expected number of sides",
    );
    assert.true(group1d8.shouldAdd(), 'dice group should be added by default');

    group1d8.die.roll = stubReturning(3);
    assert.deepEqual(
      group1d8.roll(),
      {
        total: 3,
        rolls: [3],
      },
      'roll of a single die should return expected sum',
    );

    // Create a group with multiple dice and mock them
    const group3d6 = new DiceGroup(3, 6, new RandomnessService(), false);
    assert.strictEqual(
      group3d6.numDice,
      3,
      'group should have expected number of dice',
    );
    assert.strictEqual(
      group3d6.die.sides,
      6,
      "group's dice should have expected number of sides",
    );
    assert.false(
      group3d6.shouldAdd(),
      'dice group should track whether to add value to a larger total',
    );

    group3d6.die.roll = stubReturning(3, 1, 5);
    // 3 + 1 + 5 = 9 expected sum
    assert.deepEqual(
      group3d6.roll(),
      {
        total: 9,
        rolls: [3, 1, 5],
      },
      'roll of multiple dice should return expected sum',
    );
  });

  test('it prints as expected', async function (assert) {
    assert.equal(
      new DiceGroup(1, 6, new RandomnessService()).prettyString(false),
      '1d6',
      'group being added should print as expected',
    );
    assert.equal(
      new DiceGroup(3, 12, new RandomnessService(), false).prettyString(false),
      '3d12',
      'whether a group is being subtracted should not affect its printing',
    );
    assert.equal(
      new DiceGroup(2, 10, new RandomnessService(), false).prettyString(true),
      '4d10',
      'the number of dice should be doubled when requested',
    );
    assert.equal(
      new DiceGroup(0, 4, new RandomnessService(), false).prettyString(true),
      '0d4',
      'zero dice should be handled without errors',
    );
  });
});
