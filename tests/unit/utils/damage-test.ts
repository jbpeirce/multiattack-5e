import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import DamageType from 'multiattack-5e/components/damage-type-enum';
import RandomnessService from 'multiattack-5e/services/randomness';
import { stubReturning } from 'multiattack-5e/tests/helpers/dice-helper';
import Damage from 'multiattack-5e/utils/damage';
import { DamageDetails } from 'multiattack-5e/utils/damage-details';

module('Unit | Utils | damage', function (hooks) {
  setupTest(hooks);

  test('it rolls one dice', async function (assert) {
    const damage = new Damage(
      '1d6 + 1',
      DamageType.RADIANT.name,
      new RandomnessService(),
    );

    assert.strictEqual(
      damage.damage.diceGroups.length,
      1,
      'damage should roll one group of dice',
    );

    damage.damage.diceGroups[0]!.die.roll = stubReturning(3);

    assert.deepEqual(
      damage.roll(false),
      new DamageDetails(
        DamageType.RADIANT.name,
        '1d6 + 1',
        {
          total: 4,
          rolls: [
            {
              name: '1d6',
              rolls: [3],
            },
          ],
        },
        false,
        false,
      ),
      'roll should inflict 3 + 1 = 4 total damage',
    );
  });

  test('it rolls and adds multiple dice groups', async function (assert) {
    const damage = new Damage(
      '3d8 + 1 + 2d6',
      DamageType.RADIANT.name,
      new RandomnessService(),
    );

    assert.strictEqual(
      damage.damage.diceGroups.length,
      2,
      'damage should roll two groups of dice',
    );

    damage.damage.diceGroups[0]!.die.roll = stubReturning(3, 7, 5);
    damage.damage.diceGroups[1]!.die.roll = stubReturning(1, 4);

    assert.deepEqual(
      damage.roll(false),
      new DamageDetails(
        DamageType.RADIANT.name,
        '3d8 + 2d6 + 1',
        {
          total: 21,
          rolls: [
            {
              name: '3d8',
              rolls: [3, 7, 5],
            },
            {
              name: '2d6',
              rolls: [1, 4],
            },
          ],
        },
        false,
        false,
      ),
      'roll should inflict (3 + 7 + 5) + (1 + 4) + 1 = 21 total damage',
    );
  });

  test('it doubles all dice groups on a critical hit', async function (assert) {
    const damage = new Damage(
      '3d8 + 2 + 2d6',
      DamageType.RADIANT.name,
      new RandomnessService(),
    );

    assert.strictEqual(
      damage.damage.diceGroups.length,
      2,
      'damage should roll two groups of dice',
    );

    damage.damage.diceGroups[0]!.die.roll = stubReturning(3, 7, 5, 5, 1, 2);
    damage.damage.diceGroups[1]!.die.roll = stubReturning(1, 4, 2, 2);

    assert.deepEqual(
      damage.roll(true),
      new DamageDetails(
        DamageType.RADIANT.name,
        '6d8 + 4d6 + 2',
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
        false,
        false,
      ),
      'roll should inflict 22 + (5 + 1 + 2) + (2 + 2) = 34 total damage',
    );
  });

  test('it does not allow damage to be negative', async function (assert) {
    const damage = new Damage(
      '1d4 - 3',
      DamageType.RADIANT.name,
      new RandomnessService(),
    );

    assert.strictEqual(
      damage.damage.diceGroups.length,
      1,
      'damage should roll one group of dice',
    );

    damage.damage.diceGroups[0]!.die.roll = stubReturning(1, 2);

    assert.deepEqual(
      damage.roll(false),
      new DamageDetails(
        DamageType.RADIANT.name,
        '1d4 - 3',
        {
          total: 0,
          rolls: [
            {
              name: '1d4',
              rolls: [1],
            },
          ],
        },
        false,
        false,
      ),
      'roll should inflict 1 - 3 = 0 total damage (damage cannot be negative)',
    );
  });

  test('it passes resistance to the output details', async function (assert) {
    const damage = new Damage(
      '2d6 + 1',
      DamageType.RADIANT.name,
      new RandomnessService(),
      true,
    );

    const result = damage.roll(false);
    assert.true(
      result.resisted,
      'output details should have resistance marked',
    );
    assert.false(
      result.vulnerable,
      'output details should not have vulnerability marked',
    );
  });

  test('it passes vulnerability to the output details', async function (assert) {
    const damage = new Damage(
      '2d6 + 1',
      DamageType.RADIANT.name,
      new RandomnessService(),
      false,
      true,
    );
    const result = damage.roll(false);
    assert.false(
      result.resisted,
      'output details should not have resistance marked',
    );
    assert.true(
      result.vulnerable,
      'output details should have vulnerability marked',
    );
  });
});
