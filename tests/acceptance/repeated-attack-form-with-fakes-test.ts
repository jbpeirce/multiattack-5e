import { click, fillIn, select, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import DamageType from 'multiattack-5e/components/damage-type-enum';
import type RandomnessService from 'multiattack-5e/services/randomness';

import { type ElementContext } from '../types/element-context';

module('Acceptance | repeated attack form', function (hooks) {
  setupApplicationTest(hooks);

  test('performing single attack set with maximized dice', async function (this: ElementContext, assert) {
    // Mock randomness so that all dice roll their maximum value
    const fakeRandom = sinon.fake.returns(0.99999999999999);
    const random = this.owner.lookup('service:randomness') as RandomnessService;
    random.random = fakeRandom;

    await visit('/');

    // Fill in some details for the attack
    await fillIn('[data-test-input-numberOfAttacks]', '2');
    await fillIn('[data-test-input-targetAC]', '15');
    await fillIn('[data-test-input-toHit]', '3 - 1D6');
    await fillIn('[data-test-input-damage="0"]', '1d12 + 5');
    await select('[data-test-damage-dropdown="0"]', DamageType.RADIANT.name);
    await click('[data-test-value="advantage"]');
    await click('[data-test-value="straight"]');
    await click('[data-test-input-resistant="0"]');

    // Calculate the attack
    await click('[data-test-button-getDamage]');

    assert
      .dom('[data-test-attack-data-list="0"]')
      .hasText(
        'Number of attacks: 2\n' +
          'Target AC: 15\n' +
          'Attack roll: 1d20 - 1d6 + 3\n',
        'the details for the input damage should be displayed',
      );

    // Both attacks were a critical hit, so each dealt 12 + 12 + 5 = 29 damage,
    // halved to 14 by resistance
    assert
      .dom('[data-test-total-damage-header="0"]')
      .hasText('Total Damage: 28 (2 hits)');

    // Check that the displayed text matches the expected die rolls (other
    // tests check additional details of the display). Since all dice are
    // maximized, the two attacks are identical.
    for (let i = 0; i < 2; i++) {
      // Examine the attack roll section
      assert
        .dom(`[data-test-attack-roll-detail="0-${i}"]`)
        .hasAttribute('title', '1d20: 20 | -1d6: 6')
        .hasText('17 to hit (CRIT!)');

      // Test the collapsible attack-roll details
      assert
        .dom(`[data-test-attack-roll-collapse-link="0-${i}"]`)
        .hasAria('expanded', 'false')
        .hasText('17');
      assert
        .dom(`[data-test-attack-roll-collapse-pane="0-${i}"]`)
        .hasText('1d20: 20 -1d6: 6')
        .doesNotHaveClass(
          'show',
          'attack roll detail pane should start collapsed',
        );

      // The attack roll details should be visible after a click
      await click(`[data-test-attack-roll-collapse-link="0-${i}"]`);
      // Delay briefly so that the pane finishes opening
      await delay();
      assert
        .dom(`[data-test-attack-roll-collapse-link="0-${i}"]`)
        .hasAria(
          'expanded',
          'true',
          'after click, attack roll detail pane should be expanded',
        );
      assert
        .dom(`[data-test-attack-roll-collapse-pane="0-${i}"]`)
        .hasClass(
          'show',
          'after click, attack roll detail pane should be visible',
        );

      // Do not test closing the pane; some sort of state appears to persist in
      // Bootstrap between tests, and makes closing the pane fail after the
      // first test that renders this form.

      // Examine the damage section
      assert
        .dom(`[data-test-damage-roll-detail="0-${i}-0"]`)
        .hasAttribute('title', '2d12: 12, 12')
        .hasText('14 radiant damage (2d12 + 5) (resisted)');

      // Test the collapsible damage pane
      assert
        .dom(`[data-test-damage-roll-collapse-link="0-${i}-0"]`)
        .hasAria('expanded', 'false')
        .hasText('14');
      assert
        .dom(`[data-test-damage-roll-collapse-pane="0-${i}-0"]`)
        .hasText('2d12: 12, 12');

      // The damage roll details should be visible after a click
      await click(`[data-test-damage-roll-collapse-link="0-${i}-0"]`);
      // Delay briefly so that the pane finishes opening
      await delay();
      assert
        .dom(`[data-test-damage-roll-collapse-link="0-${i}-0"]`)
        .hasAria('expanded', 'true');
      assert
        .dom(`[data-test-damage-roll-collapse-pane="0-${i}-0"]`)
        .hasClass('show');

      // Do not test closing the pane; some sort of state appears to persist in
      // Bootstrap between tests, and makes closing the pane fail after the
      // first test that renders this form.
    }
  });

  test('performing single attack set with minimized dice', async function (this: ElementContext, assert) {
    // Mock randomness so that all dice roll their minimum value
    const fakeRandom = sinon.fake.returns(0);
    const random = this.owner.lookup('service:randomness') as RandomnessService;
    random.random = fakeRandom;

    await visit('/');

    // Fill in some details for the attack
    await fillIn('[data-test-input-numberOfAttacks]', '2');
    await fillIn('[data-test-input-targetAC]', '15');
    await fillIn('[data-test-input-toHit]', '3 - 1D6');
    await fillIn('[data-test-input-damage="0"]', '1d12 + 5');
    await select('[data-test-damage-dropdown="0"]', DamageType.RADIANT.name);
    await click('[data-test-value="advantage"]');
    await click('[data-test-value="straight"]');
    await click('[data-test-input-resistant="0"]');

    // Calculate the attack
    await click('[data-test-button-getDamage]');

    assert
      .dom('[data-test-attack-data-list="0"]')
      .hasText(
        'Number of attacks: 2\n' +
          'Target AC: 15\n' +
          'Attack roll: 1d20 - 1d6 + 3\n',
        'the details for the input damage should be displayed',
      );

    // Both attacks were a natural one
    assert
      .dom('[data-test-total-damage-header="0"]')
      .hasText('Total Damage: 0 (0 hits)');

    // Check that the displayed text matches the expected die rolls (other
    // tests check additional details of the display). Since all dice are
    // minimized, the two attacks are identical.
    for (let i = 0; i < 2; i++) {
      // Examine the attack roll section
      assert
        .dom(`[data-test-attack-roll-detail="0-${i}"]`)
        .hasAttribute('title', '1d20: 1 | -1d6: 1')
        .hasText('3 to hit (NAT 1!)');

      // Test the collapsible attack-roll details
      assert
        .dom(`[data-test-attack-roll-collapse-link="0-${i}"]`)
        .hasAria('expanded', 'false')
        .hasText('3');
      assert
        .dom(`[data-test-attack-roll-collapse-pane="0-${i}"]`)
        .hasText('1d20: 1 -1d6: 1')
        .doesNotHaveClass(
          'show',
          'attack roll detail pane should start collapsed',
        );

      // The attack roll details should be visible after a click
      await click(`[data-test-attack-roll-collapse-link="0-${i}"]`);
      // Delay briefly so that the pane finishes opening
      await delay();
      assert
        .dom(`[data-test-attack-roll-collapse-link="0-${i}"]`)
        .hasAria(
          'expanded',
          'true',
          'after click, attack roll detail pane should be expanded',
        );
      assert
        .dom(`[data-test-attack-roll-collapse-pane="0-${i}"]`)
        .hasClass(
          'show',
          'after click, attack roll detail pane should be visible',
        );

      // Do not test closing the pane; some sort of state appears to persist in
      // Bootstrap between tests, and makes closing the pane fail after the
      // first test that renders this form.

      // The damage section should be empty
      assert.dom(`[data-test-damage-roll-detail="0-${i}-0"]`).doesNotExist();
    }
  });

  function delay() {
    return new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  }
});
