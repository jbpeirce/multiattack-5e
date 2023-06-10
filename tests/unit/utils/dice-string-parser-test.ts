import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import DiceStringParser from 'multiattack-5e/utils/dice-string-parser';
import DiceGroup from 'multiattack-5e/utils/dice-group';
import DiceGroupsAndModifier from 'multiattack-5e/utils/dice-groups-and-modifier';

module('Unit | Utils | dice-string-parser', function (hooks) {
  setupTest(hooks);

  test('it rejects invalid strings', async function (assert) {
    const invalidStrings = [
      'd6+4',
      '3 d5-10',
      '1d6?6',
      '4d5_0',
      '3d 5-10',
      'text 1d4+4',
      '2d6-1 following',
      '+2d6 5d8',
      '',
    ];
    assert.expect(invalidStrings.length);

    for (const invalid of invalidStrings) {
      assert.throws(
        () => DiceStringParser.parse(invalid),
        new Error(
          `Unable to parse dice groups or constants from input string "${invalid}"`
        ),
        `invalid string "${invalid}" should be rejected`
      );
    }
  });

  test('it parses valid strings', async function (assert) {
    const valid: Map<string, DiceGroupsAndModifier> = new Map();
    valid.set('1d6+4', new DiceGroupsAndModifier([new DiceGroup(1, 6)], 4));
    valid.set(
      '11d12-10',
      new DiceGroupsAndModifier([new DiceGroup(11, 12)], -10)
    );
    valid.set('4d8 + 1', new DiceGroupsAndModifier([new DiceGroup(4, 8)], 1));
    valid.set(
      '+3d5-10+1 + 2 - 1d4',
      new DiceGroupsAndModifier(
        [new DiceGroup(3, 5), new DiceGroup(1, 4, false)],
        -7
      )
    );
    valid.set('3d5', new DiceGroupsAndModifier([new DiceGroup(3, 5)], 0));
    valid.set(
      '-2d6',
      new DiceGroupsAndModifier([new DiceGroup(2, 6, false)], 0)
    );
    valid.set('40', new DiceGroupsAndModifier([], 40));
    valid.set('-40', new DiceGroupsAndModifier([], -40));
    valid.set('+40', new DiceGroupsAndModifier([], 40));

    assert.expect(valid.size);

    for (const [dmgStr, expected] of valid) {
      try {
        assert.deepEqual(
          DiceStringParser.parse(dmgStr),
          expected,
          `${dmgStr} should parse to expected value`
        );
      } catch (error) {
        assert.true(false, `Unexpected error thrown for ${dmgStr}: ${error}`);
      }
    }
  });
});
