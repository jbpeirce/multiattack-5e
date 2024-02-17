import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import AdvantageState from 'multiattack-5e/components/advantage-state-enum';
import DamageType from 'multiattack-5e/components/damage-type-enum';
import RandomnessService from 'multiattack-5e/services/randomness';
import Attack, { type DamageDetails } from 'multiattack-5e/utils/attack';
import Damage from 'multiattack-5e/utils/damage';

module('Unit | Utils | attack', function (hooks) {
  setupTest(hooks);

  test('it handles an AC-based miss correctly', async function (assert) {
    const attack = new Attack(
      '4',
      AdvantageState.STRAIGHT,
      [],
      new RandomnessService(),
    );

    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(3);
    attack.attackDie.getD20Roll = fakeD20;

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

    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(1);
    attack.attackDie.getD20Roll = fakeD20;

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

    // Fake the results of the d20 attack roll
    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(13);
    attack.attackDie.getD20Roll = fakeD20;

    const fake1d6 = sinon.fake.returns({
      total: 6,
      rolls: [6],
    });
    const attack1d6 = attack.attackDie.modifier.diceGroups[0];
    if (attack1d6) {
      attack1d6.roll = fake1d6;
    }

    const fake1d4 = sinon.fake.returns({
      total: 1,
      rolls: [1],
    });
    const attack1d4 = attack.attackDie.modifier.diceGroups[1];
    if (attack1d4) {
      attack1d4.roll = fake1d4;
    }

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
    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(13);
    attack.attackDie.getD20Roll = fakeD20;

    // Fake the results of the damage dice
    const fakePiercingDamageDetails = {
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
    };
    const fakePiercing = sinon.fake.returns(fakePiercingDamageDetails);

    const fakeRadiantDamageDetails = {
      total: 7,
      rolls: [
        {
          name: '2d8',
          rolls: [6, 1],
        },
      ],
    };
    const fakeRadiant = sinon.fake.returns(fakeRadiantDamageDetails);

    const piercing: Damage | undefined = attack.damageTypes[0];
    if (piercing) {
      piercing.roll = fakePiercing;
    }

    const radiant: Damage | undefined = attack.damageTypes[1];
    if (radiant) {
      radiant.roll = fakeRadiant;
    }

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
    const expectedDmg: DamageDetails[] = [
      {
        type: 'piercing',
        dice: '2d6 + 1d4 + 5',
        roll: fakePiercingDamageDetails,
        resisted: false,
        vulnerable: false,
      },
      {
        type: 'radiant',
        dice: '2d8',
        roll: fakeRadiantDamageDetails,
        resisted: false,
        vulnerable: false,
      },
    ];
    assert.deepEqual(
      attackData.damageDetails,
      expectedDmg,
      'damage details should match expectations',
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
    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(20);
    attack.attackDie.getD20Roll = fakeD20;

    // Fake the results of the damage dice
    const fakePiercingDamageDetails = {
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
    };
    const fakePiercing = sinon.fake.returns(fakePiercingDamageDetails);

    const fakeRadiantDamageDetails = {
      total: 14,
      rolls: [
        {
          name: '4d8',
          rolls: [3, 1, 8, 2],
        },
      ],
    };
    const fakeRadiant = sinon.fake.returns(fakeRadiantDamageDetails);

    const piercing: Damage | undefined = attack.damageTypes[0];
    if (piercing) {
      piercing.roll = fakePiercing;
    }

    const radiant: Damage | undefined = attack.damageTypes[1];
    if (radiant) {
      radiant.roll = fakeRadiant;
    }

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
    const expectedDmg: DamageDetails[] = [
      {
        type: 'piercing',
        dice: '4d6 + 2d4 + 5',
        roll: fakePiercingDamageDetails,
        resisted: false,
        vulnerable: false,
      },
      {
        type: 'radiant',
        dice: '4d8',
        roll: fakeRadiantDamageDetails,
        resisted: false,
        vulnerable: false,
      },
    ];
    assert.deepEqual(
      attackData.damageDetails,
      expectedDmg,
      'damage details should match expectations',
    );
  });
});
