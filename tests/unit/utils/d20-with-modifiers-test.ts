import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import AdvantageState from 'multiattack-5e/components/advantage-state-enum';
import RandomnessService from 'multiattack-5e/services/randomness';
import { stubReturning } from 'multiattack-5e/tests/helpers/dice-helper';
import D20WithModifiers from 'multiattack-5e/utils/d20-with-modifiers';

module('Unit | Utils | d20-with-mods', function (hooks) {
  setupTest(hooks);

  test('it rolls with advantage', async function (assert) {
    const d20 = new D20WithModifiers(
      AdvantageState.ADVANTAGE,
      '4',
      new RandomnessService(),
    );
    d20.die.roll = stubReturning(3, 7);

    assert.strictEqual(d20.getD20Roll(), 7, 'die should roll with advantage');
  });

  test('it rolls with disadvantage', async function (assert) {
    const d20 = new D20WithModifiers(
      AdvantageState.DISADVANTAGE,
      '1',
      new RandomnessService(),
    );
    d20.die.roll = stubReturning(3, 7);

    assert.strictEqual(
      d20.getD20Roll(),
      3,
      'die should roll with disadvantage',
    );
  });

  test('it rolls a straight roll', async function (assert) {
    const d20 = new D20WithModifiers(
      AdvantageState.STRAIGHT,
      '1d6',
      new RandomnessService(),
    );
    d20.die.roll = stubReturning(3, 7, 6, 1);

    assert.strictEqual(
      d20.getD20Roll(),
      3,
      'die should use the first roll when making the first straight roll',
    );

    assert.strictEqual(
      d20.getD20Roll(),
      6,
      'die should use the first roll again when making a second straight roll',
    );
  });

  test('it handles a positive constant modifier', async function (assert) {
    const d20 = new D20WithModifiers(
      AdvantageState.STRAIGHT,
      '7',
      new RandomnessService(),
    );
    d20.die.roll = stubReturning(3, 7);

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
    const d20 = new D20WithModifiers(
      AdvantageState.DISADVANTAGE,
      '-1',
      new RandomnessService(),
    );
    d20.die.roll = stubReturning(7, 3);

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
    const d20 = new D20WithModifiers(
      AdvantageState.STRAIGHT,
      '1d4 + 1',
      new RandomnessService(),
    );
    d20.die.roll = stubReturning(3, 7);
    d20.modifier.diceGroups[0]!.die.roll = stubReturning(2);

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
    const d20 = new D20WithModifiers(
      AdvantageState.STRAIGHT,
      '-1d4 + 1 + 2d6 - 3',
      new RandomnessService(),
    );
    d20.die.roll = stubReturning(10, 7);
    d20.modifier.diceGroups[0]!.die.roll = stubReturning(2);
    d20.modifier.diceGroups[1]!.die.roll = stubReturning(1, 4);

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
