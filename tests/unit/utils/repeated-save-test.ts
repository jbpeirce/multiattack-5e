import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import AdvantageState from 'multiattack-5e/components/advantage-state-enum';
import RandomnessService from 'multiattack-5e/services/randomness';
import RepeatedSave from 'multiattack-5e/utils/repeated-save';

module('Unit | Utils | repeated-save', function (hooks) {
  setupTest(hooks);

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
      damageList: [],

      totalDmg: 0,
      totalNumberOfPasses: 1,
      detailsList: [
        {
          roll: {
            total: 10, // meeting the DC passes the save
            rolls: [{ name: '1d20', rolls: [7] }],
          },
          pass: true,
          damage: 0,
          damageDetails: [],
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
      damageList: [],

      totalDmg: 0,
      totalNumberOfPasses: 0,
      detailsList: [
        {
          roll: {
            total: 6,
            rolls: [{ name: '1d20', rolls: [3] }],
          },
          pass: false,
          damage: 0,
          damageDetails: [],
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
      damageList: [],

      totalDmg: 0,
      totalNumberOfPasses: 2,
      detailsList: [
        {
          roll: {
            total: 6,
            rolls: [{ name: '1d20', rolls: [3] }],
          },
          pass: false,
          damage: 0,
          damageDetails: [],
        },
        {
          roll: {
            total: 18,
            rolls: [{ name: '1d20', rolls: [15] }],
          },
          pass: true,
          damage: 0,
          damageDetails: [],
        },
        {
          roll: {
            total: 10,
            rolls: [{ name: '1d20', rolls: [7] }],
          },
          pass: true,
          damage: 0,
          damageDetails: [],
        },
      ],
    });
  });
});
