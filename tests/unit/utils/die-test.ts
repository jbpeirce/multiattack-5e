import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Die from 'multiattack-5e/utils/die';

module('Unit | Utils | die', function (hooks) {
  setupTest(hooks);

  test('it rejects invalid numbers of sides', async function (assert) {
    assert.throws(
      () => new Die(-1),
      new Error('Die must have a positive number of sides'),
      "negative number of sides should throw error"
    );
    assert.throws(
      () => new Die(0),
      new Error('Die must have a positive number of sides'),
      "zero sides should throw error"
    );
  });

  test('it rolls dice in the expected range', async function (assert) {
    for (let sides = 1; sides < 21; sides++) {
      let die = new Die(sides);
      let roll: number = die.roll();
      assert.true(
        roll >= 1,
        `die roll ${roll} should be greater than or equal to 1`
      );
      assert.true(
        roll <= sides,
        `die roll ${roll} should be less than or equal to the number of sides on the die (${sides})`
      );
    }
  });

  test('it reaches both endpoints of the range', async function (assert) {
    // Check for off-by-one errors in the damage calculation which might
    // lead to never rolling the expected value. This test is technically
    // flaky but the odds of a 1 or 20 never being rolled are very low. 
    let rolled20 = false;
    let rolled1 = false;

    let die = new Die(20);
    for (let i = 0; i < 1000; i++) {
      let roll: number = die.roll();
      if (roll == 20) {
        rolled20 = true;
      }

      if (roll = 1) {
        rolled1 = true;
      }

      if (rolled20 && rolled1) {
        // No assertions will be called
        assert.expect(0);
        return;
      }
    }

    assert.true(rolled20, "a 20-sided die should have rolled a 20 in 1000 trials");

    assert.true(rolled1, "a 20-sided die should have rolled a 1 in 1000 trials");
  });
});
