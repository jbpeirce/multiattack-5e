import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import DiceGroup from 'multiattack-5e/utils/dice-group';
import DiceGroupsAndModifier from 'multiattack-5e/utils/dice-groups-and-modifier';

module('Unit | Utils | diceGroupAndModifier', function (hooks) {
  setupTest(hooks);

  test('it rolls one dice group', async function (assert) {
    const diceGroupAndModifier = new DiceGroupsAndModifier(
      [new DiceGroup(1, 6)],
      1
    );

    const fake1d6 = sinon.stub();
    fake1d6.onCall(0).returns(3);
    const group1d6: DiceGroup | undefined = diceGroupAndModifier.diceGroups[0];
    if (group1d6) {
      group1d6.die.roll = fake1d6;
    }

    assert.strictEqual(
      diceGroupAndModifier.rollAndGetTotal(false),
      4,
      'roll should total 3 + 1 = 4'
    );
  });

  test('it rolls double dice when instructed', async function (assert) {
    const diceGroupAndModifier = new DiceGroupsAndModifier(
      [new DiceGroup(1, 6)],
      2
    );

    const fakeD6 = sinon.stub();
    fakeD6.onCall(0).returns(3);
    fakeD6.onCall(1).returns(4);
    const group1d6: DiceGroup | undefined = diceGroupAndModifier.diceGroups[0];
    if (group1d6) {
      group1d6.die.roll = fakeD6;
    }

    assert.strictEqual(
      diceGroupAndModifier.rollAndGetTotal(true),
      9,
      'roll should inflict 3 + 4 + 2 = 9 total damage on a critical hit'
    );
  });

  test('it rolls and adds multiple dice groups', async function (assert) {
    const diceGroupAndModifier = new DiceGroupsAndModifier(
      [new DiceGroup(3, 8), new DiceGroup(2, 6, false)],
      -3
    );

    const fakeD8 = sinon.stub();
    fakeD8.onCall(0).returns(3);
    fakeD8.onCall(1).returns(7);
    fakeD8.onCall(2).returns(5);

    const group3d8: DiceGroup | undefined = diceGroupAndModifier.diceGroups[0];
    if (group3d8) {
      group3d8.die.roll = fakeD8;
    }

    const fakeD6 = sinon.stub();
    fakeD6.onCall(0).returns(1);
    fakeD6.onCall(1).returns(4);

    const group2d6: DiceGroup | undefined = diceGroupAndModifier.diceGroups[1];
    if (group2d6) {
      group2d6.die.roll = fakeD6;
    }

    assert.strictEqual(
      diceGroupAndModifier.rollAndGetTotal(false),
      7,
      'roll should inflict (3 + 7 + 5) - (1 + 4) - 3 = 7 total damage'
    );
  });

  test('it doubles all dice groups on a critical hit', async function (assert) {
    const diceGroupAndModifier = new DiceGroupsAndModifier(
      [new DiceGroup(3, 8), new DiceGroup(2, 6)],
      2
    );

    const fakeD8 = sinon.stub();
    fakeD8.onCall(0).returns(3);
    fakeD8.onCall(1).returns(7);
    fakeD8.onCall(2).returns(5);
    fakeD8.onCall(3).returns(5);
    fakeD8.onCall(4).returns(1);
    fakeD8.onCall(5).returns(2);

    const group3d8: DiceGroup | undefined = diceGroupAndModifier.diceGroups[0];
    if (group3d8) {
      group3d8.die.roll = fakeD8;
    }

    const fakeD6 = sinon.stub();
    fakeD6.onCall(0).returns(1);
    fakeD6.onCall(1).returns(4);
    fakeD6.onCall(2).returns(2);
    fakeD6.onCall(3).returns(2);

    const group2d6: DiceGroup | undefined = diceGroupAndModifier.diceGroups[1];
    if (group2d6) {
      group2d6.die.roll = fakeD6;
    }

    assert.strictEqual(
      diceGroupAndModifier.rollAndGetTotal(true),
      34,
      'roll should inflict 22 + (5 + 1 + 2) + (2 + 2) = 34 total damage'
    );
  });
});
