import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import DiceGroup from 'multiattack-5e/utils/dice-group';
import sinon from 'sinon';

module('Unit | Models | dice-group', function (hooks) {
  setupTest(hooks);

  test('it rejects invalid input values', async function (assert) {
    assert.throws(
      () => new DiceGroup(-1, 6),
      new Error("Number of dice in group must be non-negative"),
      "negative number of dice should throw an error"
    );
    assert.throws(
      () => new DiceGroup(4, -1),
      new Error('Die must have a positive number of sides'),
      "negative number of sides for dice should throw an error"
    );
  });

  test('it rolls and totals multiple dice', async function (assert) {
    let noDice = new DiceGroup(0, 6);
    assert.equal(noDice.roll(), 0, "rolling no dice should never result in a total");

    // Create a group with a single die and mock its roll
    let group1d8 = new DiceGroup(1, 8);
    assert.equal(group1d8.numDice, 1, "group should have expected number of dice");
    assert.equal(group1d8.die.sides, 8, "group's die should have expected number of sides");

    group1d8.die.roll = sinon.fake.returns(3);
    assert.equal(group1d8.roll(), 3, "roll of a single die should return expected sum");

    // Create a group with multiple dice and mock them
    let group3d6 = new DiceGroup(3, 6);
    assert.equal(group3d6.numDice, 3, "group should have expected number of dice");
    assert.equal(group3d6.die.sides, 6, "group's dice should have expected number of sides");

    let fakeDie = sinon.stub();
    fakeDie.onCall(0).returns(3);
    fakeDie.onCall(1).returns(1);
    fakeDie.onCall(2).returns(5);

    group3d6.die.roll = fakeDie
    // 1 + 3 + 5 = 9 expected sum
    assert.equal(group3d6.roll(), 9, "roll of multiple dice should return expected sum");
  });
});
