import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import DamageType from 'multiattack-5e/components/damage-type-enum';
import Attack, { type DamageDetails } from 'multiattack-5e/utils/attack';
import Damage from 'multiattack-5e/utils/damage';

module('Unit | Utils | attack', function (hooks) {
  setupTest(hooks);

  test('it rolls with advantage', async function (assert) {
    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(3);
    fakeD20.onCall(1).returns(7);

    const attack = new Attack('4', []);
    attack.die.roll = fakeD20;

    assert.strictEqual(
      attack.getD20Roll(true, false),
      7,
      'attack should roll with advantage'
    );
  });

  test('it rolls with disadvantage', async function (assert) {
    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(3);
    fakeD20.onCall(1).returns(7);

    const attack = new Attack('4', []);
    attack.die.roll = fakeD20;

    assert.strictEqual(
      attack.getD20Roll(false, true),
      3,
      'attack should roll with disadvantage'
    );
  });

  test('it rolls a straight roll with both advantage and disadvantage set', async function (assert) {
    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(3);
    fakeD20.onCall(1).returns(7);

    const attack = new Attack('4', []);
    attack.die.roll = fakeD20;

    assert.strictEqual(
      attack.getD20Roll(true, true),
      3,
      'attack should choose the first roll with advantage=disadvantage=true'
    );

    fakeD20.onCall(2).returns(6);
    fakeD20.onCall(3).returns(1);
    assert.strictEqual(
      attack.getD20Roll(true, true),
      6,
      'attack should choose the first roll with advantage=disadvantage=true'
    );
  });

  test('it rolls a straight roll with neither advantage nor disadvantage set', async function (assert) {
    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(3);
    fakeD20.onCall(1).returns(7);

    const attack = new Attack('4', []);
    attack.die.roll = fakeD20;

    assert.strictEqual(
      attack.getD20Roll(false, false),
      3,
      'attack should choose the first roll with advantage=disadvantage=false'
    );

    fakeD20.onCall(2).returns(6);
    fakeD20.onCall(3).returns(1);
    assert.strictEqual(
      attack.getD20Roll(false, false),
      6,
      'attack should choose the first roll with advantage=disadvantage=false'
    );
  });

  test('it handles an AC-based miss correctly', async function (assert) {
    const attack = new Attack('4', []);

    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(3);
    fakeD20.onCall(1).returns(20);
    attack.die.roll = fakeD20;

    // This attack rolls 3 + 4 = 7, so it should miss
    const attackData = attack.makeAttack(10, false, false);
    assert.strictEqual(attackData.roll, 7, 'attack should have rolled a 7');
    assert.false(attackData.hit, 'attack should have missed');
    assert.false(attackData.crit, 'attack was not a crit');
    assert.false(attackData.nat1, 'attack was not a nat 1');
    assert.strictEqual(
      attackData.damage,
      0,
      'no damage should have been inflicted'
    );
  });

  test('it handles a nat1 miss correctly', async function (assert) {
    const attack = new Attack('+20', []);

    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(1);
    fakeD20.onCall(1).returns(20);
    attack.die.roll = fakeD20;

    // This attack rolls a nat 1, so it should miss even though 1 + 20 > 10
    const attackData = attack.makeAttack(10, false, false);
    assert.strictEqual(
      attackData.roll,
      21,
      'attack should have rolled a 21 total'
    );
    assert.false(attackData.hit, 'attack should have missed');
    assert.false(attackData.crit, 'attack was not a crit');
    assert.true(attackData.nat1, 'attack was a nat 1');
    assert.strictEqual(
      attackData.damage,
      0,
      'no damage should have been inflicted'
    );
  });

  test('it handles a hit with a constant attack modifier correctly', async function (assert) {
    const attack = new Attack('5', [
      new Damage('2d6 + 5 + 1d4', DamageType.PIERCING.name),
      new Damage('2d8', DamageType.RADIANT.name),
    ]);

    // Fake the results of the d20 attack roll
    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(13);
    fakeD20.onCall(1).returns(3);
    attack.die.roll = fakeD20;

    // Do not fake the damage dice; this test is focused on the hit

    const attackData = attack.makeAttack(15, false, false);
    assert.strictEqual(
      attackData.roll,
      18,
      'attack should have rolled an 18 total (13 + 5)'
    );
    assert.true(attackData.hit, 'attack should have hit');
    assert.false(attackData.crit, 'attack was not a crit');
    assert.false(attackData.nat1, 'attack was not a nat 1');
    assert.true(
      attackData.damage > 0,
      'some damage should have been inflicted'
    );
  });

  test('it handles a hit with an attack modifier including dice correctly', async function (assert) {
    const attack = new Attack('5 + 1d4', [
      new Damage('2d6 + 5 + 1d4', DamageType.PIERCING.name),
      new Damage('2d8', DamageType.RADIANT.name),
    ]);

    // Fake the results of the d20 attack roll
    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(13);
    fakeD20.onCall(1).returns(3);
    attack.die.roll = fakeD20;

    const fake1d4 = sinon.fake.returns(2);
    const attack1d4 = attack.toHitModifier.diceGroups[0];
    if (attack1d4) {
      attack1d4.roll = fake1d4;
    }

    // Do not mock the results of the damage dice since it's not the focus of
    // this test

    const attackData = attack.makeAttack(15, false, false);
    assert.strictEqual(
      attackData.roll,
      20,
      'attack should have rolled a 20 total (13 + 5 + 2)'
    );
    assert.true(attackData.hit, 'attack should have hit');
    assert.false(attackData.crit, 'attack was not a crit');
    assert.false(attackData.nat1, 'attack was not a nat 1');
    assert.true(
      attackData.damage > 0,
      'some damage should have been inflicted'
    );
  });

  test('it adds damage dice as expected', async function (assert) {
    const attack = new Attack('5', [
      new Damage('2d6 + 5 + 1d4', DamageType.PIERCING.name),
      new Damage('2d8', DamageType.RADIANT.name),
    ]);

    // Fake the results of the d20 attack roll
    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(13);
    fakeD20.onCall(1).returns(3);
    attack.die.roll = fakeD20;

    // Fake the results of the damage dice
    const fakePiercing = sinon.fake.returns(13);
    const fakeRadiant = sinon.fake.returns(7);

    const piercing: Damage | undefined = attack.damageTypes[0];
    if (piercing) {
      piercing.roll = fakePiercing;
    }

    const radiant: Damage | undefined = attack.damageTypes[1];
    if (radiant) {
      radiant.roll = fakeRadiant;
    }

    const attackData = attack.makeAttack(15, false, false);
    fakePiercing.alwaysCalledWith(false);
    fakeRadiant.alwaysCalledWith(false);
    assert.strictEqual(
      attackData.roll,
      18,
      'attack should have rolled an 18 total (13 + 5)'
    );
    assert.true(attackData.hit, 'attack should have hit');
    assert.false(attackData.crit, 'attack was not a crit');
    assert.false(attackData.nat1, 'attack was not a nat 1');
    assert.strictEqual(
      attackData.damage,
      20,
      '20 damage should have been inflicted'
    );
    const expectedDmg: DamageDetails[] = [
      {
        label: 'Piercing (2d6 + 5 + 1d4)',
        roll: 13,
        resisted: false,
        vulnerable: false,
      },
      {
        label: 'Radiant (2d8)',
        roll: 7,
        resisted: false,
        vulnerable: false,
      },
    ];
    assert.deepEqual(
      attackData.damageDetails,
      expectedDmg,
      'damage details should match expectations'
    );
  });

  test('it handles a critical hit as expected', async function (assert) {
    const attack = new Attack('-5', [
      new Damage('2d6 + 5 + 1d4', DamageType.PIERCING.name),
      new Damage('2d8', DamageType.RADIANT.name),
    ]);

    // Fake the results of the d20 attack roll
    const fakeD20 = sinon.stub();
    fakeD20.onCall(0).returns(20);
    fakeD20.onCall(1).returns(3);
    attack.die.roll = fakeD20;

    // Fake the results of the damage dice
    const fakePiercing = sinon.fake.returns(25);
    const fakeRadiant = sinon.fake.returns(14);

    const piercing: Damage | undefined = attack.damageTypes[0];
    if (piercing) {
      piercing.roll = fakePiercing;
    }

    const radiant: Damage | undefined = attack.damageTypes[1];
    if (radiant) {
      radiant.roll = fakeRadiant;
    }

    const attackData = attack.makeAttack(25, false, false);
    fakePiercing.alwaysCalledWith(true);
    fakeRadiant.alwaysCalledWith(true);
    assert.strictEqual(
      attackData.roll,
      15,
      'attack should have rolled an 15 total (20 - 5)'
    );
    assert.true(
      attackData.hit,
      'attack should have hit (despite being below the target AC)'
    );
    assert.true(attackData.crit, 'attack was a crit');
    assert.false(attackData.nat1, 'attack was not a nat 1');
    assert.strictEqual(
      attackData.damage,
      39,
      '39 damage should have been inflicted (25 + 14)'
    );
    const expectedDmg: DamageDetails[] = [
      {
        label: 'Piercing (2d6 + 5 + 1d4)',
        roll: 25,
        resisted: false,
        vulnerable: false,
      },
      {
        label: 'Radiant (2d8)',
        roll: 14,
        resisted: false,
        vulnerable: false,
      },
    ];
    assert.deepEqual(
      attackData.damageDetails,
      expectedDmg,
      'damage details should match expectations'
    );
  });

  test('it capitalizes words as expected', async function (assert) {
    assert.strictEqual(
      Attack.capitalizeWord(''),
      '',
      'empty string should be capitalized correctly'
    );

    assert.strictEqual(
      Attack.capitalizeWord('a'),
      'A',
      'single letter should be capitalized correctly'
    );

    assert.strictEqual(
      Attack.capitalizeWord('radiant'),
      'Radiant',
      'multi-letter word should be capitalized correctly'
    );
  });
});
