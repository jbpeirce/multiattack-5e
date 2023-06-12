import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { ElementContext } from 'multiattack-5e/tests/types/element-context';
import AdvantageState from 'multiattack-5e/components/advantage-state';

module('Integration | Component | detail-display', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders planned attack details before any attack', async function (this: ElementContext, assert) {
    this.set('advantageState', AdvantageState.DISADVANTAGE);

    await render(
      hbs`<DetailDisplay @numberOfAttacks=8 @targetAC=15 @toHit="3 - 1d6" @damage="2d6 + 5" @damageType="Acid" @advantageState={{this.advantageState}} @resistant=true @vulnerable=true @attackTriggered=false />`
    );

    assert
      .dom('[data-test-plan-detail-list]')
      .hasText(
        'Target AC: 15\n' +
          'Number of attacks: 8\n' +
          'Attack roll: 1d20 + 3 - 1d6 (rolls with disadvantage)\n' +
          'Attack damage: 2d6 + 5 Acid damage (target resistant) (target vulnerable)',
        'the details for the input damage should be displayed'
      );
  });

  test('it renders attack details after the attack', async function (this: ElementContext, assert) {
    this.set('advantageState', AdvantageState.DISADVANTAGE);
    this.set('attackDetails', [
      {
        roll: 25,
        hit: true,
        crit: true,
        nat1: false,
        damage: 4,
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

    await render(
      hbs`<DetailDisplay @numberOfAttacks=8 @targetAC=15 @toHit="3 - 1d6" @damage="2d6 + 5" @damageType="Acid" @advantageState={{this.advantageState}} @resistant=true @vulnerable=true @attackTriggered=false @attackTriggered=true @totalDmg=4 @attackDetailsList={{this.attackDetails}} />`
    );

    assert
      .dom('[data-test-plan-detail-list]')
      .hasText(
        'Target AC: 15\n' +
          'Number of attacks: 8\n' +
          'Attack roll: 1d20 + 3 - 1d6 (rolls with disadvantage)\n' +
          'Attack damage: 2d6 + 5 Acid damage (target resistant) (target vulnerable)',
        'the details for the input damage should be displayed'
      );

    assert
      .dom('[data-test-total-damage-header]')
      .isVisible('damage header should be displayed');

    assert
      .dom('[data-test-total-damage-header]')
      .hasText('*** Total Damage: 4 ***');

    assert
      .dom('[data-test-attack-detail-list]')
      .isVisible('attack details should be displayed');

    const detailsList = this.element.querySelector(
      '[data-test-attack-detail-list]'
    )?.children;
    assert.true(detailsList != null, 'detail list should be present');
    if (detailsList) {
      assert.equal(
        detailsList.length,
        5,
        '5 attacks should have been displayed'
      );

      assert.equal(
        detailsList[0]?.textContent?.trim().replace(/\s+/g, ' '),
        'Attack inflicted 4 damage with an attack roll of 25 (CRIT!)'
      );
      assert.equal(
        detailsList[1]?.textContent?.trim().replace(/\s+/g, ' '),
        'Attack missed with an attack roll of -4'
      );
      assert.equal(
        detailsList[2]?.textContent?.trim().replace(/\s+/g, ' '),
        'Attack missed with an attack roll of 13'
      );
      assert.equal(
        detailsList[3]?.textContent?.trim().replace(/\s+/g, ' '),
        'Attack missed with an attack roll of -5 (NAT 1!)'
      );
      assert.equal(
        detailsList[4]?.textContent?.trim().replace(/\s+/g, ' '),
        'Attack missed with an attack roll of 6'
      );
    }
  });
});
