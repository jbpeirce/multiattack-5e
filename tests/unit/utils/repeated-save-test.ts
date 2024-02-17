import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import AdvantageState from 'multiattack-5e/components/advantage-state-enum';
import RandomnessService from 'multiattack-5e/services/randomness';
import RepeatedSave from 'multiattack-5e/utils/repeated-save';

module('Unit | Utils | repeated-save', function (hooks) {
  setupTest(hooks);

  test('it rejects inconsistant damage states', async function (assert) {
    assert.false(
      new RepeatedSave(
        1,
        10,
        '3',
        AdvantageState.ADVANTAGE,
        new RandomnessService(),
        true,
        null,
        true,
        [],
      ).valid(),
      'if damage is expected, whether to roll new damage for each save must be set',
    );

    assert.false(
      new RepeatedSave(
        1,
        10,
        '3',
        AdvantageState.ADVANTAGE,
        new RandomnessService(),
        true,
        false,
        null,
        [],
      ).valid(),
      'if damage is expected save-for-half must be set',
    );

    assert.true(
      new RepeatedSave(
        1,
        10,
        '3',
        AdvantageState.ADVANTAGE,
        new RandomnessService(),
        true,
        true,
        true,
        [],
      ).valid(),
      'even if damage is expected, an empty damage list is allowed',
    );
  });

  test('it rolls a save with advantage', async function (assert) {
    const repeatedSave = new RepeatedSave(
      1,
      10,
      '3',
      AdvantageState.ADVANTAGE,
      new RandomnessService(),
      false,
    );

    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(3);
    fakeD20.onCall(1).returns(7);
    repeatedSave.die.die.roll = fakeD20;

    const result = repeatedSave.simulateRepeatedSaves();
    assert.deepEqual(result, {
      numberOfSaves: 1,
      saveDC: 10,
      modifier: '3',
      advantageState: AdvantageState.ADVANTAGE,
      inflictsDamage: false,
      damageList: null,

      totalDmg: 0,
      totalNumberOfPasses: 1,
      saveDetailsList: [
        {
          roll: {
            total: 10, // meeting the DC passes the save
            rolls: [{ name: '1d20', rolls: [7] }],
          },
          pass: true,
          inflictsDamage: false,
          damage: null,
          damageDetails: null,
        },
      ],
    });
  });

  test('it rolls a save with disadvantage', async function (assert) {
    const repeatedSave = new RepeatedSave(
      1,
      10,
      '3',
      AdvantageState.DISADVANTAGE,
      new RandomnessService(),
      false,
    );

    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(3);
    fakeD20.onCall(1).returns(15);
    repeatedSave.die.die.roll = fakeD20;

    const result = repeatedSave.simulateRepeatedSaves();
    assert.deepEqual(result, {
      numberOfSaves: 1,
      saveDC: 10,
      modifier: '3',
      advantageState: AdvantageState.DISADVANTAGE,
      inflictsDamage: false,
      damageList: null,

      totalDmg: 0,
      totalNumberOfPasses: 0,
      saveDetailsList: [
        {
          roll: {
            total: 6,
            rolls: [{ name: '1d20', rolls: [3] }],
          },
          pass: false,
          inflictsDamage: false,
          damage: null,
          damageDetails: null,
        },
      ],
    });
  });

  test('it rolls multiple saves with passes and failures', async function (assert) {
    const repeatedSave = new RepeatedSave(
      3,
      10,
      '3',
      AdvantageState.STRAIGHT,
      new RandomnessService(),
      false,
    );

    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(3);
    fakeD20.onCall(1).returns(2); // ignored

    fakeD20.onCall(2).returns(15);
    fakeD20.onCall(3).returns(2); // ignored

    fakeD20.onCall(4).returns(7);
    fakeD20.onCall(5).returns(2); // ignored

    repeatedSave.die.die.roll = fakeD20;

    const result = repeatedSave.simulateRepeatedSaves();
    assert.deepEqual(result, {
      numberOfSaves: 3,
      saveDC: 10,
      modifier: '3',
      advantageState: AdvantageState.STRAIGHT,
      inflictsDamage: false,
      damageList: null,

      totalDmg: 0,
      totalNumberOfPasses: 2,
      saveDetailsList: [
        {
          roll: {
            total: 6,
            rolls: [{ name: '1d20', rolls: [3] }],
          },
          pass: false,
          inflictsDamage: false,
          damage: null,
          damageDetails: null,
        },
        {
          roll: {
            total: 18,
            rolls: [{ name: '1d20', rolls: [15] }],
          },
          pass: true,
          inflictsDamage: false,
          damage: null,
          damageDetails: null,
        },
        {
          roll: {
            total: 10,
            rolls: [{ name: '1d20', rolls: [7] }],
          },
          pass: true,
          inflictsDamage: false,
          damage: null,
          damageDetails: null,
        },
      ],
    });
  });
});
