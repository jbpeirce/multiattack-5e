import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import DamageType from 'multiattack-5e/components/damage-type-enum';
import { DamageDetails } from 'multiattack-5e/utils/damage-details';

module('Unit | Utils | damage-details', function (hooks) {
  setupTest(hooks);

  test('it halves damage for resistant targets', async function (assert) {
    const details = new DamageDetails(
      DamageType.RADIANT.name,
      '2d6 + 1',
      {
        total: 9,
        rolls: [
          {
            name: '2d6',
            rolls: [3, 5],
          },
        ],
      },
      true,
      false,
    );
    assert.equal(
      details.getInflictedDamage(),
      4,
      'roll should inflict (3 + 5 + 1) / 2 = 4 total damage',
    );
  });

  test('it doubles damage for vulnerable targets', async function (assert) {
    const details = new DamageDetails(
      DamageType.RADIANT.name,
      '2d6 + 1',
      {
        total: 9,
        rolls: [
          {
            name: '2d6',
            rolls: [3, 5],
          },
        ],
      },
      false,
      true,
    );
    assert.equal(
      details.getInflictedDamage(),
      18,
      'roll should inflict (3 + 5 + 1) * 2 = 18 total damage',
    );
  });

  test('it halves, then doubles, damage for resistant and vulnerable targets', async function (assert) {
    const details = new DamageDetails(
      DamageType.RADIANT.name,
      '2d6 + 1',
      {
        total: 9,
        rolls: [
          {
            name: '2d6',
            rolls: [3, 5],
          },
        ],
      },
      true,
      true,
    );
    assert.equal(
      details.getInflictedDamage(),
      8,
      'roll should inflict ((3 + 5 + 1) / 2) * 2 = 8 total damage',
    );
  });

  test('it applies a fractional input modifier', async function (assert) {
    const details = new DamageDetails(
      DamageType.RADIANT.name,
      '2d6 + 1',
      {
        total: 9,
        rolls: [
          {
            name: '2d6',
            rolls: [3, 5],
          },
        ],
      },
      false,
      false,
    );
    assert.equal(
      details.getInflictedDamage(0.9),
      8,
      'roll should inflict (3 + 5 + 1) * 0.9 = 8 total damage',
    );
  });

  test('it applies an input modifier before applying resistance', async function (assert) {
    const details = new DamageDetails(
      DamageType.RADIANT.name,
      '1d4',
      {
        total: 1,
        rolls: [
          {
            name: '1d4',
            rolls: [1],
          },
        ],
      },
      true,
      false,
    );
    assert.equal(
      details.getInflictedDamage(2),
      1,
      'roll should inflict floor(1 * 2) / 2 = 1 damage, not floor(1 / 2) * 2 = 0 damage',
    );
  });

  test('it applies an input modifier before applying vulnerability', async function (assert) {
    const details = new DamageDetails(
      DamageType.RADIANT.name,
      '2d6 + 1',
      {
        total: 9,
        rolls: [
          {
            name: '2d6',
            rolls: [3, 5],
          },
        ],
      },
      false,
      true,
    );
    assert.equal(
      details.getInflictedDamage(0.5),
      8,
      'roll should inflict floor(9 * 0.5) * 2 = 8 damage, not floor(9 * 2) * 0.5 = 9 damage',
    );
  });
});
