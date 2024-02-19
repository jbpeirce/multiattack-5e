import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import DamageType from 'multiattack-5e/components/damage-type-enum';
import RandomnessService from 'multiattack-5e/services/randomness';
import Damage from 'multiattack-5e/utils/damage';
import { DamageDetails } from 'multiattack-5e/utils/damage-details';
import DiceGroup from 'multiattack-5e/utils/dice-group';

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

    const fake1d6 = sinon.stub();
    fake1d6.onCall(0).returns(3);
    const group1d6: DiceGroup | undefined = damage.damage.diceGroups[0];
    if (group1d6) {
      group1d6.die.roll = fake1d6;
    }

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

    const fakeD8 = sinon.stub();
    fakeD8.onCall(0).returns(3);
    fakeD8.onCall(1).returns(7);
    fakeD8.onCall(2).returns(5);

    const group3d8: DiceGroup | undefined = damage.damage.diceGroups[0];
    if (group3d8) {
      group3d8.die.roll = fakeD8;
    }

    const fakeD6 = sinon.stub();
    fakeD6.onCall(0).returns(1);
    fakeD6.onCall(1).returns(4);

    const group2d6: DiceGroup | undefined = damage.damage.diceGroups[1];
    if (group2d6) {
      group2d6.die.roll = fakeD6;
    }

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

    const fakeD8 = sinon.stub();
    fakeD8.onCall(0).returns(3);
    fakeD8.onCall(1).returns(7);
    fakeD8.onCall(2).returns(5);
    fakeD8.onCall(3).returns(5);
    fakeD8.onCall(4).returns(1);
    fakeD8.onCall(5).returns(2);

    const group3d8: DiceGroup | undefined = damage.damage.diceGroups[0];
    if (group3d8) {
      group3d8.die.roll = fakeD8;
    }

    const fakeD6 = sinon.stub();
    fakeD6.onCall(0).returns(1);
    fakeD6.onCall(1).returns(4);
    fakeD6.onCall(2).returns(2);
    fakeD6.onCall(3).returns(2);

    const group2d6: DiceGroup | undefined = damage.damage.diceGroups[1];
    if (group2d6) {
      group2d6.die.roll = fakeD6;
    }

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

    const fakeD4 = sinon.stub();
    fakeD4.onCall(0).returns(1);
    fakeD4.onCall(1).returns(2);
    const group1d4: DiceGroup | undefined = damage.damage.diceGroups[0];
    if (group1d4) {
      group1d4.die.roll = fakeD4;
    }

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
