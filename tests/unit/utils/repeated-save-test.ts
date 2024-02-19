import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import AdvantageState from 'multiattack-5e/components/advantage-state-enum';
import DamageType from 'multiattack-5e/components/damage-type-enum';
import RandomnessService from 'multiattack-5e/services/randomness';
import Damage from 'multiattack-5e/utils/damage';
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

  test('it handles damage correctly when save-for-half is true', async function (assert) {
    const repeatedSave = new RepeatedSave(
      2,
      10,
      '3',
      AdvantageState.STRAIGHT,
      new RandomnessService(),
      false,
      true,
      [new Damage('2d8', DamageType.RADIANT.name, new RandomnessService())],
    );

    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(3);
    fakeD20.onCall(1).returns(15);
    repeatedSave.die.getD20Roll = fakeD20; //stubReturning(3, 15);

    const fakeD8 = sinon.stub();
    fakeD8.onCall(0).returns(4);
    fakeD8.onCall(1).returns(5);
    repeatedSave.damageTypes[0]!.damage.diceGroups[0]!.die.roll = fakeD8;

    const result = repeatedSave.simulateRepeatedSaves();

    // Other tests check the overall structure of the result; focus on the
    // damage
    assert.strictEqual(
      result.totalDmg,
      13,
      'both saves should have inflicted damage (with the same damage roll for both saves) for a total of 9 + (9/2) = 13 damage',
    );

    // Inspect the failed save
    const failedSaveDetails = result.detailsList[0];
    assert.false(
      failedSaveDetails?.pass,
      'the failed save should be listed first',
    );
    assert.strictEqual(
      failedSaveDetails?.damage,
      9,
      'failed save should inflict 9 damage',
    );

    assert.strictEqual(
      failedSaveDetails?.damageDetails.length,
      1,
      'failed save should have one damage detail',
    );
    assert.strictEqual(
      failedSaveDetails?.damageDetails[0]!.inflicted,
      9,
      "failed save's damage should have inflicted 9 damage",
    );
    assert.strictEqual(
      failedSaveDetails?.damageDetails[0]!.details.roll.total,
      9,
      "failed save's damage should have rolled 9 total damage",
    );
    assert.deepEqual(
      failedSaveDetails?.damageDetails[0]!.details.roll.rolls,
      [
        {
          name: '2d8',
          rolls: [4, 5],
        },
      ],
      "failed save's damage should reflect mocked die rolls",
    );

    // Inspect the passed save
    const passedSaveDetails = result.detailsList[1];
    assert.true(
      passedSaveDetails?.pass,
      'the passed save should be listed second',
    );
    assert.strictEqual(
      passedSaveDetails?.damage,
      4,
      'passed save should inflict half damage',
    );

    assert.strictEqual(
      passedSaveDetails?.damageDetails.length,
      1,
      'passed save should have one damage detail',
    );
    assert.strictEqual(
      passedSaveDetails?.damageDetails[0]!.inflicted,
      4,
      "passed save's damage should have inflicted 4 damage",
    );
    assert.strictEqual(
      passedSaveDetails?.damageDetails[0]!.details.roll.total,
      9,
      "passed save's damage should have rolled 9 total damage",
    );
    assert.deepEqual(
      passedSaveDetails?.damageDetails[0]!.details.roll.rolls,
      [
        {
          name: '2d8',
          rolls: [4, 5],
        },
      ],
      "passed save's damage should reflect mocked die rolls",
    );
  });

  test('it handles damage correctly when save-for-half is false', async function (assert) {
    const repeatedSave = new RepeatedSave(
      2,
      10,
      '3',
      AdvantageState.STRAIGHT,
      new RandomnessService(),
      false,
      false,
      [new Damage('2d8', DamageType.RADIANT.name, new RandomnessService())],
    );

    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(3);
    fakeD20.onCall(1).returns(15);
    repeatedSave.die.getD20Roll = fakeD20; //stubReturning(3, 15);

    const fakeD8 = sinon.stub();
    fakeD8.onCall(0).returns(4);
    fakeD8.onCall(1).returns(5);
    repeatedSave.damageTypes[0]!.damage.diceGroups[0]!.die.roll = fakeD8;

    const result = repeatedSave.simulateRepeatedSaves();

    // Other tests check the overall structure of the result; focus on the
    // damage
    assert.strictEqual(
      result.totalDmg,
      9,
      'only the failed save should have inflicted damage for a total of 9 damage',
    );

    // Inspect the failed save
    const failedSaveDetails = result.detailsList[0];
    assert.false(
      failedSaveDetails?.pass,
      'the failed save should be listed first',
    );
    assert.strictEqual(
      failedSaveDetails?.damage,
      9,
      'failed save should inflict 9 damage',
    );

    assert.strictEqual(
      failedSaveDetails?.damageDetails.length,
      1,
      'failed save should have one damage detail',
    );
    assert.strictEqual(
      failedSaveDetails?.damageDetails[0]!.inflicted,
      9,
      "failed save's damage should have inflicted 9 total damage",
    );
    assert.strictEqual(
      failedSaveDetails?.damageDetails[0]!.details.roll.total,
      9,
      "failed save's damage should have rolled 9 total damage",
    );
    assert.deepEqual(
      failedSaveDetails?.damageDetails[0]!.details.roll.rolls,
      [
        {
          name: '2d8',
          rolls: [4, 5],
        },
      ],
      "failed save's damage should reflect mocked die rolls",
    );

    // Inspect the passed save
    const passedSaveDetails = result.detailsList[1];
    assert.true(
      passedSaveDetails?.pass,
      'the passed save should be listed second',
    );
    assert.strictEqual(
      passedSaveDetails?.damage,
      0,
      'passed save should inflict no damage',
    );
    assert.deepEqual(
      passedSaveDetails?.damageDetails,
      [],
      'passed save should have no damage details',
    );
  });

  test('it handles resistance and vulnerability', async function (assert) {
    const repeatedSave = new RepeatedSave(
      2,
      10,
      '3',
      AdvantageState.STRAIGHT,
      new RandomnessService(),
      false,
      true,
      [
        new Damage(
          '2d8',
          DamageType.RADIANT.name,
          new RandomnessService(),
          true,
        ),
        new Damage(
          '3d4',
          DamageType.COLD.name,
          new RandomnessService(),
          false,
          true,
        ),
      ],
    );

    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(3);
    fakeD20.onCall(1).returns(15);
    repeatedSave.die.getD20Roll = fakeD20; //stubReturning(3, 15);

    const fakeD8 = sinon.stub();
    fakeD8.onCall(0).returns(4);
    fakeD8.onCall(1).returns(5);
    repeatedSave.damageTypes[0]!.damage.diceGroups[0]!.die.roll = fakeD8;

    const fakeD4 = sinon.stub();
    fakeD4.onCall(0).returns(4);
    fakeD4.onCall(1).returns(2);
    fakeD4.onCall(2).returns(1);
    repeatedSave.damageTypes[1]!.damage.diceGroups[0]!.die.roll = fakeD4;

    const result = repeatedSave.simulateRepeatedSaves();

    // Other tests check the overall structure of the result; focus on the
    // damage
    assert.strictEqual(
      result.totalDmg,
      26,
      'both saves should have inflicted damage (with the same damage roll for both saves) for a total of 18 + 8 = 26 damage',
    );

    // Inspect the failed save
    const failedSaveDetails = result.detailsList[0];
    assert.false(
      failedSaveDetails?.pass,
      'the failed save should be listed first',
    );
    assert.strictEqual(
      failedSaveDetails?.damage,
      18,
      'failed save should inflict 9 / 2 radiant damage (resistance) and 7 * 2 cold damage (vulnerability)',
    );

    assert.strictEqual(
      failedSaveDetails?.damageDetails.length,
      2,
      'failed save should have two damage details',
    );

    let radiantDetails = failedSaveDetails!.damageDetails[0]!;
    assert.strictEqual(
      radiantDetails.details.type,
      DamageType.RADIANT.name,
      "failed save's first damage type should be radiant",
    );
    assert.strictEqual(
      radiantDetails.inflicted,
      4,
      "failed save's first damage type should have inflicted 4 total damage (resistance)",
    );
    assert.strictEqual(
      radiantDetails.details.roll.total,
      9,
      "failed save's first damage type should have rolled 9 total damage",
    );

    let coldDetails = failedSaveDetails!.damageDetails[1]!;
    assert.strictEqual(
      coldDetails.details.type,
      DamageType.COLD.name,
      "failed save's second damage type should be cold",
    );
    assert.strictEqual(
      coldDetails.inflicted,
      14,
      "failed save's second damage type should have inflicted 14 total damage (vulnerability)",
    );
    assert.strictEqual(
      coldDetails.details.roll.total,
      7,
      "failed save's second damage type should have rolled 7 total damage",
    );

    // Inspect the passed save
    const passedSaveDetails = result.detailsList[1];
    assert.true(
      passedSaveDetails?.pass,
      'the passed save should be listed second',
    );
    assert.strictEqual(
      passedSaveDetails?.damage,
      8,
      'passed save should inflict (9 / 2) / 2 radiant damage (passed save + resistance) and (7 / 2) * 2 of the cold damage rolled (passed save + vulnerability)',
    );

    radiantDetails = passedSaveDetails!.damageDetails[0]!;
    assert.strictEqual(
      radiantDetails.details.type,
      DamageType.RADIANT.name,
      "passed save's first damage type should be radiant",
    );
    assert.strictEqual(
      radiantDetails.inflicted,
      2,
      "passed save's first damage type should have inflicted 2 total damage (passed + resistance)",
    );
    assert.strictEqual(
      radiantDetails.details.roll.total,
      9,
      "passed save's first damage type should have rolled 9 total damage",
    );

    coldDetails = passedSaveDetails!.damageDetails[1]!;
    assert.strictEqual(
      coldDetails.details.type,
      DamageType.COLD.name,
      "passed save's second damage type should be cold",
    );
    assert.strictEqual(
      coldDetails.inflicted,
      6,
      "passed save's second damage type should have inflicted 6 total damage (passed + vulnerability)",
    );
    assert.strictEqual(
      coldDetails.details.roll.total,
      7,
      "passed save's second damage type should have rolled 7 total damage",
    );
  });
});
