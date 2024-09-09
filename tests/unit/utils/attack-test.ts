import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import AdvantageState from 'multiattack-5e/components/advantage-state-enum';
import DamageType from 'multiattack-5e/components/damage-type-enum';
import RandomnessService from 'multiattack-5e/services/randomness';
import { stubReturning } from 'multiattack-5e/tests/helpers/dice-helper';
import Attack from 'multiattack-5e/utils/attack';
import Damage from 'multiattack-5e/utils/damage';
import { DamageDetails } from 'multiattack-5e/utils/damage-details';

module('Unit | Utils | attack', function (hooks) {
  setupTest(hooks);

  test('it displays advantage correctly', async function (assert) {
    const attack = new Attack(
      '4',
      AdvantageState.ADVANTAGE,
      [],
      new RandomnessService(),
    );
    attack.attackDie.die.roll = stubReturning(3, 8);

    // This attack rolls 8 + 4 = 12
    const attackData = attack.makeAttack(10);
    assert.deepEqual(
      attackData.roll,
      { total: 12, rolls: [{ name: '1d20', rolls: [3, 8] }] },
      'attack should have rolled a 12',
    );
  });

  test('it displays disadvantage correctly', async function (assert) {
    const attack = new Attack(
      '4',
      AdvantageState.DISADVANTAGE,
      [],
      new RandomnessService(),
    );
    attack.attackDie.die.roll = stubReturning(3, 8);

    // This attack rolls 3 + 4 = 7
    const attackData = attack.makeAttack(10);
    assert.deepEqual(
      attackData.roll,
      { total: 7, rolls: [{ name: '1d20', rolls: [3, 8] }] },
      'attack should have rolled a 7',
    );
  });

  test('it handles an AC-based miss correctly', async function (assert) {
    const attack = new Attack(
      '4',
      AdvantageState.STRAIGHT,
      [],
      new RandomnessService(),
    );
    attack.attackDie.die.roll = stubReturning(3, 8);

    // This attack rolls 3 + 4 = 7, so it should miss
    const attackData = attack.makeAttack(10);
    assert.deepEqual(
      attackData.roll,
      { total: 7, rolls: [{ name: '1d20', rolls: [3] }] },
      'attack should have rolled a 7',
    );
    assert.false(attackData.hit, 'attack should have missed');
    assert.false(attackData.crit, 'attack was not a crit');
    assert.false(attackData.nat1, 'attack was not a nat 1');
    assert.strictEqual(
      attackData.damage,
      0,
      'no damage should have been inflicted',
    );
  });

  test('it handles a nat1 miss correctly', async function (assert) {
    const attack = new Attack(
      '+20',
      AdvantageState.STRAIGHT,
      [],
      new RandomnessService(),
    );
    attack.attackDie.die.roll = stubReturning(1, 8);

    // This attack rolls a nat 1, so it should miss even though 1 + 20 > 10
    const attackData = attack.makeAttack(10);
    assert.deepEqual(
      attackData.roll,
      { total: 21, rolls: [{ name: '1d20', rolls: [1] }] },
      'attack should have rolled a 21 total',
    );
    assert.false(attackData.hit, 'attack should have missed');
    assert.false(attackData.crit, 'attack was not a crit');
    assert.true(attackData.nat1, 'attack was a nat 1');
    assert.strictEqual(
      attackData.damage,
      0,
      'no damage should have been inflicted',
    );
  });

  test('it handles a hit with a complex attack modifier correctly', async function (assert) {
    const attack = new Attack(
      '5 - 1d6 + 1d4 - 1',
      AdvantageState.STRAIGHT,
      [
        new Damage(
          '2d6 + 5 + 1d4',
          DamageType.PIERCING.name,
          new RandomnessService(),
        ),
        new Damage('2d8', DamageType.RADIANT.name, new RandomnessService()),
      ],
      new RandomnessService(),
    );

    // Fake the results of the attack-roll dice
    attack.attackDie.die.roll = stubReturning(13, 8);
    attack.attackDie.modifier.diceGroups[0]!.roll = stubReturning({
      total: 6,
      rolls: [6],
    });
    attack.attackDie.modifier.diceGroups[1]!.roll = stubReturning({
      total: 1,
      rolls: [1],
    });

    // Do not mock the results of the damage dice since it's not the focus of
    // this test

    const attackData = attack.makeAttack(15);
    assert.deepEqual(
      attackData.roll,
      {
        total: 12,
        rolls: [
          { name: '1d20', rolls: [13] },
          { name: '-1d6', rolls: [6] },
          { name: '1d4', rolls: [1] },
        ],
      },
      'attack should have rolled a 20 total (13 + 5 + 2 + 1 - 1)',
    );
    assert.false(attackData.hit, 'attack should not have hit');
  });

  test('it adds damage dice as expected', async function (assert) {
    const attack = new Attack(
      '5',
      AdvantageState.STRAIGHT,
      [
        new Damage(
          '2d6 + 5 + 1d4',
          DamageType.PIERCING.name,
          new RandomnessService(),
        ),
        new Damage('2d8', DamageType.RADIANT.name, new RandomnessService()),
      ],
      new RandomnessService(),
    );

    // Fake the results of the d20 attack roll
    attack.attackDie.die.roll = stubReturning(13, 8);

    // Fake the results of the damage dice
    const fakePiercingDamageDetails = new DamageDetails(
      DamageType.PIERCING.name,
      '2d6 + 1d4 + 5',
      {
        total: 13,
        rolls: [
          {
            name: '2d6',
            rolls: [3, 4],
          },
          {
            name: '1d4',
            rolls: [1],
          },
        ],
      },
      false,
      false,
    );
    const fakePiercing = sinon.fake.returns(fakePiercingDamageDetails);

    const fakeRadiantDamageDetails = new DamageDetails(
      DamageType.RADIANT.name,
      '2d8',
      {
        total: 7,
        rolls: [
          {
            name: '2d8',
            rolls: [6, 1],
          },
        ],
      },
      false,
      false,
    );
    const fakeRadiant = sinon.fake.returns(fakeRadiantDamageDetails);

    attack.damageTypes[0]!.roll = fakePiercing;
    attack.damageTypes[1]!.roll = fakeRadiant;

    const attackData = attack.makeAttack(15);
    fakePiercing.alwaysCalledWith(false);
    fakeRadiant.alwaysCalledWith(false);
    assert.deepEqual(
      attackData.roll,
      { total: 18, rolls: [{ name: '1d20', rolls: [13] }] },
      'attack should have rolled an 18 total (13 + 5)',
    );
    assert.true(attackData.hit, 'attack should have hit');
    assert.false(attackData.crit, 'attack was not a crit');
    assert.false(attackData.nat1, 'attack was not a nat 1');
    assert.strictEqual(
      attackData.damage,
      20,
      '20 damage should have been inflicted',
    );

    assert.deepEqual(
      attackData.damageDetails[0]?.details,
      fakePiercingDamageDetails,
      'piercing damage details should match expectations',
    );
    assert.deepEqual(
      attackData.damageDetails[1]?.details,
      fakeRadiantDamageDetails,
      'radiant damage details should match expectations',
    );
  });

  test('it handles a critical hit as expected', async function (assert) {
    const attack = new Attack(
      '-5',
      AdvantageState.STRAIGHT,
      [
        new Damage(
          '2d6 + 5 + 1d4',
          DamageType.PIERCING.name,
          new RandomnessService(),
        ),
        new Damage('2d8', DamageType.RADIANT.name, new RandomnessService()),
      ],
      new RandomnessService(),
    );

    // Fake the results of the d20 attack roll
    attack.attackDie.die.roll = stubReturning(20, 8);

    // Fake the results of the damage dice
    const fakePiercingDamageDetails = new DamageDetails(
      DamageType.PIERCING.name,
      '4d6 + 2d4 + 5',
      {
        total: 25,
        rolls: [
          {
            name: '4d6',
            rolls: [3, 4, 6, 2],
          },
          {
            name: '2d4',
            rolls: [1, 4],
          },
        ],
      },
      false,
      false,
    );
    const fakePiercing = sinon.fake.returns(fakePiercingDamageDetails);

    const fakeRadiantDamageDetails = new DamageDetails(
      DamageType.PIERCING.name,
      '4d8',
      {
        total: 14,
        rolls: [
          {
            name: '4d8',
            rolls: [3, 1, 8, 2],
          },
        ],
      },
      false,
      false,
    );
    const fakeRadiant = sinon.fake.returns(fakeRadiantDamageDetails);

    attack.damageTypes[0]!.roll = fakePiercing;
    attack.damageTypes[1]!.roll = fakeRadiant;

    const attackData = attack.makeAttack(25);
    fakePiercing.alwaysCalledWith(true);
    fakeRadiant.alwaysCalledWith(true);
    assert.deepEqual(
      attackData.roll,
      { total: 15, rolls: [{ name: '1d20', rolls: [20] }] },
      'attack should have rolled an 15 total (20 - 5)',
    );
    assert.true(
      attackData.hit,
      'attack should have hit (despite being below the target AC)',
    );
    assert.true(attackData.crit, 'attack was a crit');
    assert.false(attackData.nat1, 'attack was not a nat 1');
    assert.strictEqual(
      attackData.damage,
      39,
      '39 damage should have been inflicted (25 + 14)',
    );

    assert.deepEqual(
      attackData.damageDetails[0]?.details,
      fakePiercingDamageDetails,
      'piercing damage details should match expectations',
    );
    assert.deepEqual(
      attackData.damageDetails[1]?.details,
      fakeRadiantDamageDetails,
      'radiant damage details should match expectations',
    );
  });
});
