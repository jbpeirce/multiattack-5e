import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import DiceStringParser, { DiceGroupsAndNumber } from 'multiattack-5e/utils/dice-string-parser';
import DiceGroup from 'multiattack-5e/utils/dice-group';

module('Unit | Utils | dice-string-parser', function (hooks) {
    setupTest(hooks);

    test('it rejects invalid strings', async function (assert) {
        let invalidStrings = [
            "d6+4",
            "3 d5-10",
            "1d6?6",
            "4d5_0",
            "3d 5-10",
            "text 1d4+4",
            "2d6-1 following",
            "+2d6 5d8"
        ];

        for (const invalid of invalidStrings) {
            assert.throws(
                () => new DiceStringParser().parse(invalid),
                new Error("Unable to parse dice groups or constants from input string"),
                `invalid string ${invalid} should be rejected`
            );
        }
    });

    test('it parses valid strings', async function (assert) {
        const valid: Map<string, DiceGroupsAndNumber> = new Map();
        valid.set("1d6+4", {
            diceGroups: [new DiceGroup(1, 6)], modifier: 4
        });
        valid.set("11d12-10", {
            diceGroups: [new DiceGroup(11, 12)], modifier: -10
        });
        valid.set("4d8 + 1", {
            diceGroups: [new DiceGroup(4, 8)], modifier: 1
        });
        valid.set("+3d5-10+1 + 2 - 1d4", {
            diceGroups: [new DiceGroup(3, 5), new DiceGroup(1, 4, false)], modifier: -7
        });
        valid.set("3d5", {
            diceGroups: [new DiceGroup(3, 5)], modifier: 0
        });
        valid.set("-2d6", {
            diceGroups: [new DiceGroup(2, 6, false)], modifier: 0
        });
        valid.set("40", {
            diceGroups: [], modifier: 40
        });

        let parser = new DiceStringParser()
        for (const [dmgStr, expected] of valid) {
            try {
                assert.deepEqual(parser.parse(dmgStr), expected, `${dmgStr} should parse to expected value`);
            } catch (error) {
                assert.true(false, `Unexpected error thrown for ${dmgStr}: ${error}`);
            }
        }
    });
});
