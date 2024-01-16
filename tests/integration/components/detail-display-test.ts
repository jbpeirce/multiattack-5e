import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import AdvantageState from 'multiattack-5e/components/advantage-state-enum';
import DamageType from 'multiattack-5e/components/damage-type-enum';
import { type ElementContext } from 'multiattack-5e/tests/types/element-context';
import Damage from 'multiattack-5e/utils/damage';

module('Integration | Component | detail-display', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders multiple hits and misses in a single repeated attack', async function (this: ElementContext, assert) {
    this.set('repeatedAttackDetails', [
      {
        numberOfAttacks: 8,
        targetAC: 15,
        toHit: '3 - 1d6',
        damageList: [
          new Damage('2d6 + 5 + 1d4', DamageType.PIERCING.name, true, false),
          new Damage('2d8', DamageType.RADIANT.name, false, true),
        ],
        advantageState: AdvantageState.DISADVANTAGE,
        totalDmg: 62,
        totalNumberOfHits: 2,
        attackDetailsList: [
          {
            roll: 25,
            hit: true,
            crit: true,
            nat1: false,
            damage: 37,
            damageDetails: [
              {
                type: 'piercing',
                dice: '4d6 + 2d4 + 5',
                roll: 11,
                resisted: true,
                vulnerable: false,
              },
              {
                type: 'radiant',
                dice: '4d8',
                roll: 26,
                resisted: false,
                vulnerable: true,
              },
            ],
          },
          {
            roll: 18,
            hit: true,
            crit: false,
            nat1: false,
            damage: 25,
            damageDetails: [
              {
                type: 'piercing',
                dice: '2d6 + 1d4 + 5',
                roll: 5,
                resisted: true,
                vulnerable: false,
              },
              {
                type: 'radiant',
                dice: '2d8',
                roll: 20,
                resisted: false,
                vulnerable: true,
              },
            ],
          },
          {
            roll: -4,
            hit: false,
            crit: false,
            nat1: false,
            damage: 0,
          },
          {
            roll: 13,
            hit: false,
            crit: false,
            nat1: false,
            damage: 0,
          },
          {
            roll: -5,
            hit: false,
            crit: false,
            nat1: true,
            damage: 0,
          },
          {
            roll: 6,
            hit: false,
            crit: false,
            nat1: false,
            damage: 0,
          },
        ],
      },
    ]);

    await render(
      hbs`<DetailDisplay @repeatedAttackLog={{this.repeatedAttackDetails}} />`,
    );

    assert
      .dom('[data-test-attack-data-list="0"]')
      .hasText(
        'Number of attacks: 8\n' +
          'Target AC: 15\n' +
          'Attack roll: 1d20 + 3 - 1d6 (disadvantage)\n',
        'the details for the input damage should be displayed',
      );

    assert
      .dom('[data-test-total-damage-header="0"]')
      .isVisible('damage header should be displayed');

    assert
      .dom('[data-test-total-damage-header="0"]')
      .hasText('Total Damage: 62 (2 hits)');

    assert
      .dom('[data-test-attack-detail-list="0"]')
      .isVisible('attack details should be displayed');

    const detailsList = this.element.querySelector(
      '[data-test-attack-detail-list="0"]',
    )?.children;
    assert.true(detailsList != null, 'detail list should be present');
    if (detailsList) {
      assert.equal(
        detailsList.length,
        6,
        '6 attacks should have been displayed',
      );

      assert.equal(
        detailsList[0]?.className,
        'li-hit',
        'critical hit should have bullet point formatted as a hit',
      );
      assert.equal(
        detailsList[0]?.textContent?.trim().replace(/\s+/g, ' '),
        'Attack roll: 25 (CRIT!) 11 piercing damage (4d6 + 2d4 + 5) (resisted) 26 radiant damage (4d8) (vulnerable)',
        'critical hit should have expected detail text',
      );

      assert.equal(
        detailsList[1]?.className,
        'li-hit',
        'normal hit should have bullet point formatted as a hit',
      );
      assert.equal(
        detailsList[1]?.textContent?.trim().replace(/\s+/g, ' '),
        'Attack roll: 18 5 piercing damage (2d6 + 1d4 + 5) (resisted) 20 radiant damage (2d8) (vulnerable)',
        'normal hit should have expected detail text',
      );

      assert.equal(
        detailsList[2]?.className,
        'li-miss',
        'negative attack roll should have bullet point formatted as a miss',
      );
      assert.equal(
        detailsList[2]?.textContent?.trim().replace(/\s+/g, ' '),
        'Attack roll: -4',
        'negative attack roll should have expected detail text',
      );

      assert.equal(
        detailsList[3]?.className,
        'li-miss',
        'double-digit attack roll with a miss should have bullet point formatted as a miss',
      );
      assert.equal(
        detailsList[3]?.textContent?.trim().replace(/\s+/g, ' '),
        'Attack roll: 13',
        'double-digit attack roll with a miss should have expected detail text',
      );

      assert.equal(
        detailsList[4]?.className,
        'li-miss',
        'natural one should have bullet point formatted as a miss',
      );
      assert.equal(
        detailsList[4]?.textContent?.trim().replace(/\s+/g, ' '),
        'Attack roll: -5 (NAT 1!)',
        'natural one should have expected detail text',
      );

      assert.equal(
        detailsList[5]?.className,
        'li-miss',
        'single-digit attack roll with a miss should have bullet point formatted as a miss',
      );
      assert.equal(
        detailsList[5]?.textContent?.trim().replace(/\s+/g, ' '),
        'Attack roll: 6',
        'single-digit attack roll with a miss should have expected detail text',
      );
    }

    const critDamageDetailsList = this.element.querySelector(
      '[data-test-damage-detail-list="0-0"]',
    )?.children;
    assert.true(
      critDamageDetailsList != null,
      'damage detail list should be present',
    );
    if (critDamageDetailsList) {
      assert.equal(
        critDamageDetailsList.length,
        2,
        '2 types of damage should have been displayed',
      );

      assert.equal(
        critDamageDetailsList[0]?.textContent?.trim().replace(/\s+/g, ' '),
        '11 piercing damage (4d6 + 2d4 + 5) (resisted)',
        'piercing damage details should be displayed',
      );
      assert.equal(
        critDamageDetailsList[1]?.textContent?.trim().replace(/\s+/g, ' '),
        '26 radiant damage (4d8) (vulnerable)',
        'radiant damage details should be displayed',
      );
    }

    const regularDamageDetailsList = this.element.querySelector(
      '[data-test-damage-detail-list="0-1"]',
    )?.children;
    assert.true(
      regularDamageDetailsList != null,
      'damage detail list should be present',
    );
    if (regularDamageDetailsList) {
      assert.equal(
        regularDamageDetailsList.length,
        2,
        '2 types of damage should have been displayed',
      );

      assert.equal(
        regularDamageDetailsList[0]?.textContent?.trim().replace(/\s+/g, ' '),
        '5 piercing damage (2d6 + 1d4 + 5) (resisted)',
        'piercing damage details should be displayed',
      );
      assert.equal(
        regularDamageDetailsList[1]?.textContent?.trim().replace(/\s+/g, ' '),
        '20 radiant damage (2d8) (vulnerable)',
        'radiant damage details should be displayed',
      );
    }
  });

  test('it renders a single hit correctly', async function (this: ElementContext, assert) {
    this.set('repeatedAttackDetails', [
      {
        numberOfAttacks: 2,
        targetAC: 15,
        toHit: '-3',
        damageList: [
          new Damage('2d6 + 5 + 1d4', DamageType.PIERCING.name, true, false),
          new Damage('2d8', DamageType.RADIANT.name, false, true),
        ],
        advantageState: AdvantageState.STRAIGHT,
        totalDmg: 25,
        totalNumberOfHits: 1,
        attackDetailsList: [
          {
            roll: 18,
            hit: true,
            crit: false,
            nat1: false,
            damage: 25,
            damageDetails: [
              {
                type: 'piercing',
                dice: '2d6 + 1d4 + 5',
                roll: 5,
                resisted: true,
                vulnerable: false,
              },
              {
                type: 'radiant',
                dice: '2d8',
                roll: 20,
                resisted: false,
                vulnerable: true,
              },
            ],
          },
          {
            roll: -4,
            hit: false,
            crit: false,
            nat1: false,
            damage: 0,
          },
        ],
      },
    ]);

    await render(
      hbs`<DetailDisplay @repeatedAttackLog={{this.repeatedAttackDetails}} />`,
    );

    assert
      .dom('[data-test-attack-data-list="0"]')
      .hasText(
        'Number of attacks: 2\nTarget AC: 15\nAttack roll: 1d20 -3\n',
        'the details for the attack should be displayed',
      );

    assert
      .dom('[data-test-total-damage-header="0"]')
      .isVisible('damage header should be displayed');

    assert
      .dom('[data-test-total-damage-header="0"]')
      .hasText('Total Damage: 25 (1 hit)');

    assert
      .dom('[data-test-attack-detail-list="0"]')
      .isVisible('attack details should be displayed');

    assert.equal(
      this.element.querySelector('[data-test-attack-detail-list="0"]')?.children
        .length,
      2,
      '2 attacks should have been displayed',
    );
  });

  test('it renders multiple repeated attacks correctly', async function (this: ElementContext, assert) {
    this.set('repeatedAttackDetails', [
      {
        numberOfAttacks: 2,
        targetAC: 15,
        toHit: '-3',
        damageList: [
          new Damage('2d6 + 5 + 1d4', DamageType.PIERCING.name, true, false),
          new Damage('2d8', DamageType.RADIANT.name, false, true),
        ],
        advantageState: AdvantageState.STRAIGHT,
        totalDmg: 15,
        totalNumberOfHits: 1,
        attackDetailsList: [
          {
            roll: 18,
            hit: true,
            crit: false,
            nat1: false,
            damage: 15,
            damageDetails: [
              {
                type: 'piercing',
                dice: '2d6 + 1d4 + 5',
                roll: 5,
                resisted: true,
                vulnerable: false,
              },
              {
                type: 'radiant',
                dice: '2d8',
                roll: 10,
                resisted: false,
                vulnerable: false,
              },
            ],
          },
          {
            roll: -4,
            hit: false,
            crit: false,
            nat1: false,
            damage: 0,
          },
        ],
      },
      {
        numberOfAttacks: 1,
        targetAC: 14,
        toHit: '3',
        damageList: [new Damage('3d6', DamageType.ACID.name, true, true)],
        advantageState: AdvantageState.ADVANTAGE,
        totalDmg: 9,
        totalNumberOfHits: 1,
        attackDetailsList: [
          {
            roll: 15,
            hit: true,
            crit: false,
            nat1: false,
            damage: 9,
            damageDetails: [
              {
                type: 'acid',
                dice: '3d6',
                roll: 9,
                resisted: true,
                vulnerable: true,
              },
            ],
          },
        ],
      },
    ]);

    await render(
      hbs`<DetailDisplay @repeatedAttackLog={{this.repeatedAttackDetails}} />`,
    );

    // First attack
    assert
      .dom('[data-test-attack-data-list="0"]')
      .hasText(
        'Number of attacks: 2\nTarget AC: 15\nAttack roll: 1d20 -3\n',
        'first attack: the details for the attack should be displayed',
      );

    assert
      .dom('[data-test-total-damage-header="0"]')
      .hasText('Total Damage: 15 (1 hit)');

    const detailsList1 = this.element.querySelector(
      '[data-test-attack-detail-list="0"]',
    )?.children;
    assert.true(detailsList1 != null, 'detail list should be present');
    if (detailsList1) {
      assert.equal(
        detailsList1.length,
        2,
        'first attack: 2 attacks should have been displayed',
      );

      assert.equal(
        detailsList1[0]?.className,
        'li-hit',
        'first attack: hit should have bullet point formatted as a hit',
      );
      assert.equal(
        detailsList1[0]?.textContent?.trim().replace(/\s+/g, ' '),
        'Attack roll: 18 5 piercing damage (2d6 + 1d4 + 5) (resisted) 10 radiant damage (2d8)',
        'first attack: hit should have expected detail text',
      );

      assert.equal(
        detailsList1[1]?.className,
        'li-miss',
        'first attack: miss should have bullet point formatted as a miss',
      );
      assert.equal(
        detailsList1[1]?.textContent?.trim().replace(/\s+/g, ' '),
        'Attack roll: -4',
        'first attack: miss should have expected detail text',
      );
    }

    // Second attack
    assert
      .dom('[data-test-attack-data-list="1"]')
      .hasText(
        'Number of attacks: 1\nTarget AC: 14\nAttack roll: 1d20 + 3 (advantage)\n',
        'second attack: the details for the attack should be displayed',
      );

    assert
      .dom('[data-test-total-damage-header="1"]')
      .hasText('Total Damage: 9 (1 hit)');

    const detailsList2 = this.element.querySelector(
      '[data-test-attack-detail-list="1"]',
    )?.children;
    assert.true(detailsList2 != null, 'detail list should be present');
    if (detailsList2) {
      assert.equal(
        detailsList2.length,
        1,
        'second attack: 1 attack should have been displayed',
      );

      assert.equal(
        detailsList2[0]?.className,
        'li-hit',
        'second attack: hit should have bullet point formatted as a hit',
      );
      assert.equal(
        detailsList2[0]?.textContent?.trim().replace(/\s+/g, ' '),
        'Attack roll: 15 9 acid damage (3d6) (resisted) (vulnerable)',
        'second attack: hit should have expected detail text',
      );
    }
  });
});
