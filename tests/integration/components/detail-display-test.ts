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

  test('it renders planned attack details before any attack', async function (this: ElementContext, assert) {
    this.set('advantageState', AdvantageState.DISADVANTAGE);
    this.set('damageList', [
      new Damage('2d6 + 5', DamageType.ACID.name, true, true),
    ]);

    await render(
      hbs`<DetailDisplay @numberOfAttacks={{8}} @targetAC={{15}} @toHit="- 1d6" @advantageState={{this.advantageState}} @damageList={{this.damageList}} @attackTriggered={{false}} />`,
    );

    assert
      .dom('[data-test-plan-detail-list]')
      .hasText(
        'Target AC: 15\n' +
          'Number of attacks: 8\n' +
          'Attack roll: 1d20 - 1d6 (rolls with disadvantage)\n' +
          'Attack damage: 2d6 + 5 acid damage (target resistant) (target vulnerable)',
        'the details for the input damage should be displayed',
      );

    const damageList = this.element.querySelector(
      '[data-test-plan-detail-damage-list]',
    )?.children;
    assert.equal(damageList?.length, 1, 'damage list should have one entry');
    if (damageList) {
      assert.equal(
        damageList[0]?.textContent?.trim().replace(/\s+/g, ' '),
        '2d6 + 5 acid damage (target resistant) (target vulnerable)',
        'acid damage details should be displayed',
      );
    }
  });

  test('it renders attack details after the attack', async function (this: ElementContext, assert) {
    this.set('advantageState', AdvantageState.DISADVANTAGE);
    this.set('attackDetails', [
      {
        roll: 25,
        hit: true,
        crit: true,
        nat1: false,
        damage: 37,
        damageDetails: [
          {
            label: 'piercing (2d6 + 5 + 1d4)',
            roll: 11,
            resisted: true,
            vulnerable: false,
          },
          {
            label: 'radiant (2d8)',
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
            label: 'piercing (2d6 + 5 + 1d4)',
            roll: 5,
            resisted: true,
            vulnerable: false,
          },
          {
            label: 'radiant (2d8)',
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
    ]);
    this.set('damageList', [
      new Damage('2d6 + 5', DamageType.ACID.name, true, true),
    ]);

    await render(
      hbs`<DetailDisplay @numberOfAttacks={{8}} @targetAC={{15}} @toHit="3 - 1d6" @advantageState={{this.advantageState}} @damageList={{this.damageList}} @attackTriggered={{true}} @totalDmg={{62}} @numberOfHits={{2}} @attackDetailsList={{this.attackDetails}} />`,
    );

    assert
      .dom('[data-test-plan-detail-list]')
      .hasText(
        'Target AC: 15\n' +
          'Number of attacks: 8\n' +
          'Attack roll: 1d20 + 3 - 1d6 (rolls with disadvantage)\n' +
          'Attack damage: 2d6 + 5 acid damage (target resistant) (target vulnerable)',
        'the details for the input damage should be displayed',
      );

    assert
      .dom('[data-test-total-damage-header]')
      .isVisible('damage header should be displayed');

    assert
      .dom('[data-test-total-damage-header]')
      .hasText('*** Total Damage: 62 (2 hits) ***');

    assert
      .dom('[data-test-attack-detail-list]')
      .isVisible('attack details should be displayed');

    const detailsList = this.element.querySelector(
      '[data-test-attack-detail-list]',
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
        'Attack roll: 25 (CRIT!) piercing (2d6 + 5 + 1d4): 11 damage inflicted (resisted) radiant (2d8): 26 damage inflicted (vulnerable)',
        'critical hit should have expected detail text',
      );

      assert.equal(
        detailsList[1]?.className,
        'li-hit',
        'normal hit should have bullet point formatted as a hit',
      );
      assert.equal(
        detailsList[1]?.textContent?.trim().replace(/\s+/g, ' '),
        'Attack roll: 18 piercing (2d6 + 5 + 1d4): 5 damage inflicted (resisted) radiant (2d8): 20 damage inflicted (vulnerable)',
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
      '[data-test-damage-detail-list="0"]',
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
        'piercing (2d6 + 5 + 1d4): 11 damage inflicted (resisted)',
        'piercing damage details should be displayed',
      );
      assert.equal(
        critDamageDetailsList[1]?.textContent?.trim().replace(/\s+/g, ' '),
        'radiant (2d8): 26 damage inflicted (vulnerable)',
        'radiant damage details should be displayed',
      );
    }

    const regularDamageDetailsList = this.element.querySelector(
      '[data-test-damage-detail-list="1"]',
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
        'piercing (2d6 + 5 + 1d4): 5 damage inflicted (resisted)',
        'piercing damage details should be displayed',
      );
      assert.equal(
        regularDamageDetailsList[1]?.textContent?.trim().replace(/\s+/g, ' '),
        'radiant (2d8): 20 damage inflicted (vulnerable)',
        'radiant damage details should be displayed',
      );
    }
  });

  test('it renders a single attack correctly', async function (this: ElementContext, assert) {
    this.set('advantageState', AdvantageState.ADVANTAGE);
    this.set('attackDetails', [
      {
        roll: 18,
        hit: true,
        crit: false,
        nat1: false,
        damage: 25,
        damageDetails: [
          {
            label: 'piercing (2d6 + 5 + 1d4)',
            roll: 5,
            resisted: true,
            vulnerable: false,
          },
          {
            label: 'radiant (2d8)',
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
    ]);
    this.set('damageList', [
      new Damage('2d6 + 5', DamageType.ACID.name, true, true),
    ]);

    await render(
      hbs`<DetailDisplay @numberOfAttacks={{2}} @targetAC={{15}} @toHit="3 - 1d6" @advantageState={{this.advantageState}} @damageList={{this.damageList}} @attackTriggered={{true}} @totalDmg={{25}} @numberOfHits={{1}} @attackDetailsList={{this.attackDetails}} />`,
    );

    assert
      .dom('[data-test-plan-detail-list]')
      .hasText(
        'Target AC: 15\n' +
          'Number of attacks: 2\n' +
          'Attack roll: 1d20 + 3 - 1d6 (rolls with advantage)\n' +
          'Attack damage: 2d6 + 5 acid damage (target resistant) (target vulnerable)',
        'the details for the input damage should be displayed',
      );

    assert
      .dom('[data-test-total-damage-header]')
      .isVisible('damage header should be displayed');

    assert
      .dom('[data-test-total-damage-header]')
      .hasText('*** Total Damage: 25 (1 hit) ***');

    assert
      .dom('[data-test-attack-detail-list]')
      .isVisible('attack details should be displayed');
  });
});
