import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import RandomnessService from 'multiattack-5e/services/randomness';
import { stubReturning } from 'multiattack-5e/tests/helpers/dice-helper';
import DiceGroup from 'multiattack-5e/utils/dice-group';
import DiceGroupsAndModifier from 'multiattack-5e/utils/dice-groups-and-modifier';

module('Unit | Utils | diceGroupAndModifier', function (hooks) {
  setupTest(hooks);

  test('it rolls one dice group', async function (assert) {
    const diceGroupAndModifier = new DiceGroupsAndModifier(
      [new DiceGroup(1, 6, new RandomnessService())],
      1,
    );

    diceGroupAndModifier.diceGroups[0]!.die.roll = stubReturning(3);

    assert.deepEqual(
      diceGroupAndModifier.roll(false),
      {
        total: 4,
        rolls: [
          {
            name: '1d6',
            rolls: [3],
          },
        ],
      },
      'roll should total 3 + 1 = 4',
    );
  });

  test('it rolls double dice when instructed', async function (assert) {
    const diceGroupAndModifier = new DiceGroupsAndModifier(
      [new DiceGroup(1, 6, new RandomnessService())],
      2,
    );

    diceGroupAndModifier.diceGroups[0]!.die.roll = stubReturning(3, 4);

    assert.deepEqual(
      diceGroupAndModifier.roll(true),
      {
        total: 9,
        rolls: [
          {
            name: '2d6',
            rolls: [3, 4],
          },
        ],
      },
      'roll should inflict 3 + 4 + 2 = 9 total damage on a critical hit',
    );
  });

  test('it rolls and adds multiple dice groups', async function (assert) {
    const diceGroupAndModifier = new DiceGroupsAndModifier(
      [
        new DiceGroup(3, 8, new RandomnessService()),
        new DiceGroup(2, 6, new RandomnessService(), false),
      ],
      -3,
    );

    diceGroupAndModifier.diceGroups[0]!.die.roll = stubReturning(3, 7, 5);
    diceGroupAndModifier.diceGroups[1]!.die.roll = stubReturning(1, 4);

    assert.deepEqual(
      diceGroupAndModifier.roll(false),
      {
        total: 7,
        rolls: [
          {
            name: '3d8',
            rolls: [3, 7, 5],
          },
          {
            name: '-2d6',
            rolls: [1, 4],
          },
        ],
      },
      'roll should inflict (3 + 7 + 5) - (1 + 4) - 3 = 7 total damage',
    );
  });

  test('it doubles all dice groups on a critical hit', async function (assert) {
    const diceGroupAndModifier = new DiceGroupsAndModifier(
      [
        new DiceGroup(3, 8, new RandomnessService()),
        new DiceGroup(2, 6, new RandomnessService()),
      ],
      2,
    );

    diceGroupAndModifier.diceGroups[0]!.die.roll = stubReturning(
      3,
      7,
      5,
      5,
      1,
      2,
    );
    diceGroupAndModifier.diceGroups[1]!.die.roll = stubReturning(1, 4, 2, 2);

    assert.deepEqual(
      diceGroupAndModifier.roll(true),
      {
        total: 34,
        rolls: [
          {
            name: '6d8',
            rolls: [3, 7, 5, 5, 1, 2],
          },
          {
            name: '4d6',
            rolls: [1, 4, 2, 2],
          },
        ],
      },
      'roll should inflict 22 + (5 + 1 + 2) + (2 + 2) = 34 total damage',
    );
  });

  test('it prints as expected', async function (assert) {
    assert.equal(
      new DiceGroupsAndModifier(
        [
          new DiceGroup(3, 8, new RandomnessService()),
          new DiceGroup(2, 12, new RandomnessService()),
        ],
        2,
      ).prettyString(false),
      '3d8 + 2d12 + 2',
      'groups and modifiers being added should print as expected',
    );
    assert.equal(
      new DiceGroupsAndModifier(
        [
          new DiceGroup(3, 8, new RandomnessService()),
          new DiceGroup(2, 4, new RandomnessService(), false),
        ],
        -5,
      ).prettyString(false),
      '3d8 - 2d4 - 5',
      'groups and modifiers being subtracted should print as expected',
    );
    assert.equal(
      new DiceGroupsAndModifier([], 12).prettyString(false),
      '12',
      'solitary positive modifier should print as expected',
    );
    assert.equal(
      new DiceGroupsAndModifier([], -5).prettyString(false),
      '- 5',
      'solitary negative modifier should print as expected',
    );
    assert.equal(
      new DiceGroupsAndModifier([], 0).prettyString(false),
      '0',
      '0 modifier should print if there are no accompanying dice groups',
    );
    assert.equal(
      new DiceGroupsAndModifier(
        [new DiceGroup(1, 4, new RandomnessService())],
        0,
      ).prettyString(false),
      '1d4',
      'single dice group should print as expected',
    );
    assert.equal(
      new DiceGroupsAndModifier(
        [new DiceGroup(1, 4, new RandomnessService(), false)],
        0,
      ).prettyString(false),
      '- 1d4',
      'single negative dice group should print as expected',
    );
    assert.equal(
      new DiceGroupsAndModifier(
        [
          new DiceGroup(3, 8, new RandomnessService()),
          new DiceGroup(2, 4, new RandomnessService(), false),
        ],
        -5,
      ).prettyString(true),
      '6d8 - 4d4 - 5',
      'doubled dice should print as expected',
    );
    assert.equal(
      new DiceGroupsAndModifier([], 12).prettyString(true),
      '12',
      'solitary positive modifier should not be affected by doubled-dice parameter',
    );
  });
});
