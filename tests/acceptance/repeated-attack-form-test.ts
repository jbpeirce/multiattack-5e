import { click, currentURL, fillIn, select, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import DamageType from 'multiattack-5e/components/damage-type-enum';

import { type ElementContext } from '../types/element-context';

module('Acceptance | repeated attack form', function (hooks) {
  setupApplicationTest(hooks);

  test('visiting /', async function (assert) {
    await visit('/');

    assert.strictEqual(
      currentURL(),
      '/',
      'should have navigated to the root url',
    );

    assert
      .dom('#nav-attacks [data-test-attack-form-label]')
      .isVisible('attack setup heading should be displayed');
    assert
      .dom('#nav-attacks [data-test-log-header]')
      .hasText('Attack Log', 'attack log heading should be displayed');
  });

  test('performing single set of attacks', async function (this: ElementContext, assert) {
    await visit('/');

    // Fill in some details for the attack
    await fillIn('#nav-attacks [data-test-input-numberOfAttacks]', '8');
    await fillIn('#nav-attacks [data-test-input-targetAC]', '15');
    await fillIn('#nav-attacks [data-test-input-toHit]', '3 - 1D6');
    await fillIn('#nav-attacks [data-test-input-damage="0"]', '2d6 + 5');
    await select(
      '#nav-attacks [data-test-damage-dropdown="0"]',
      DamageType.RADIANT.name,
    );
    await click('#nav-attacks [data-test-value="advantage"]');
    await click('#nav-attacks [data-test-value="disadvantage"]');
    await click('#nav-attacks [data-test-input-resistant="0"]');

    assert
      .dom('#nav-attacks [data-test-total-damage-header="0"]')
      .isNotVisible(
        'damage header should not be displayed before the attack has been requested',
      );

    // Calculate the attack
    await click('#nav-attacks [data-test-button-getDamage]');

    assert
      .dom('#nav-attacks [data-test-data-list="0"]')
      .hasText(
        'Number of attacks: 8\n' +
          'Target AC: 15\n' +
          'Attack roll: 1d20 - 1d6 + 3 (disadvantage)\n',
        'the details for the set of attacks should be displayed',
      );

    assert
      .dom('#nav-attacks [data-test-total-damage-header="0"]')
      .isVisible('damage header should be displayed')
      .hasTextContaining('Total Damage');

    assert
      .dom('#nav-attacks [data-test-detail-list="0"]')
      .isVisible('individual attack details should be displayed');

    assert.strictEqual(
      this.element.querySelector('#nav-attacks [data-test-detail-list="0"]')!
        .children.length,
      8,
      '8 attacks should have been displayed',
    );
  });

  test('performing repeated sets of attacks', async function (this: ElementContext, assert) {
    await visit('/');

    // Fill in some details for the attack
    await fillIn('#nav-attacks [data-test-input-numberOfAttacks]', '8');
    await fillIn('#nav-attacks [data-test-input-targetAC]', '15');
    await fillIn('#nav-attacks [data-test-input-toHit]', '3 - 1D6');
    await click('#nav-attacks [data-test-value="disadvantage"]');

    // Calculate the attack
    await click('#nav-attacks [data-test-button-getDamage]');

    // Change some attack details
    await fillIn('#nav-attacks [data-test-input-numberOfAttacks]', '4');
    await click('#nav-attacks [data-test-value="advantage"]');
    await fillIn('#nav-attacks [data-test-input-toHit]', '3');

    // Attack again
    await click('#nav-attacks [data-test-button-getDamage]');

    // The second attack should be displayed first
    assert
      .dom('#nav-attacks [data-test-data-list="0"]')
      .hasText(
        'Number of attacks: 4\n' +
          'Target AC: 15\n' +
          'Attack roll: 1d20 + 3 (advantage)\n',
        'the details for the second set of attacks should be displayed',
      );

    assert
      .dom('#nav-attacks [data-test-detail-list="0"]')
      .isVisible('attack details should be displayed for the second attack');

    assert.strictEqual(
      this.element.querySelector('#nav-attacks [data-test-detail-list="0"]')!
        .children.length,
      4,
      '4 attacks should have been displayed for the second set of attacks',
    );

    // The first repeated attack should still be visible
    assert
      .dom('#nav-attacks [data-test-data-list="1"]')
      .hasText(
        'Number of attacks: 8\n' +
          'Target AC: 15\n' +
          'Attack roll: 1d20 - 1d6 + 3 (disadvantage)\n',
        'the details for the first set of attacks should be displayed',
      );

    assert
      .dom('#nav-attacks [data-test-detail-list="1"]')
      .isVisible('attack details should be displayed for the first attack');

    assert.strictEqual(
      this.element.querySelector('#nav-attacks [data-test-detail-list="1"]')!
        .children.length,
      8,
      '8 attacks should have been displayed for the first set of attacks',
    );
  });

  test('adding and removing damage types', async function (assert) {
    await visit('/');

    // Initially, there should be one damage type displayed
    assert
      .dom('#nav-attacks [data-test-input-damage="0"]')
      .exists('one damage type should exist');
    assert
      .dom('#nav-attacks [data-test-input-damage="1"]')
      .doesNotExist('only one damage type should exist');
    assert
      .dom('#nav-attacks [data-test-damage-dropdown="0"]')
      .hasValue(
        DamageType.PIERCING.name,
        'damage 0 should be piercing (by default)',
      );

    // Add another damage type
    await click('#nav-attacks [data-test-button-add-damage-type]');

    assert
      .dom('#nav-attacks [data-test-input-damage="0"]')
      .exists('after add damage type, one damage type should exist');
    assert
      .dom('#nav-attacks [data-test-input-damage="1"]')
      .exists('after add damage type, a second damage type should exist');
    assert
      .dom('#nav-attacks [data-test-input-damage="2"]')
      .doesNotExist('after add damage type, a third damage type should exist');

    // Customize the damage type dropdown for the newly added damage type
    await select(
      '#nav-attacks [data-test-damage-dropdown="1"]',
      DamageType.FIRE.name,
    );
    assert
      .dom('#nav-attacks [data-test-damage-dropdown="0"]')
      .hasValue(
        DamageType.PIERCING.name,
        'damage 0 should be piercing (by default)',
      );
    assert
      .dom('#nav-attacks [data-test-damage-dropdown="1"]')
      .hasValue(
        DamageType.FIRE.name,
        'damage 1 should be fire (after the dropdown reset the value)',
      );

    // Add a third damage type
    await click('#nav-attacks [data-test-button-add-damage-type]');

    assert
      .dom('#nav-attacks [data-test-input-damage="0"]')
      .exists('after a second add damage type, one damage type should exist');
    assert
      .dom('#nav-attacks [data-test-input-damage="1"]')
      .exists(
        'after a second add damage type, a second damage type should exist',
      );
    assert
      .dom('#nav-attacks [data-test-input-damage="2"]')
      .exists(
        'after a second add damage type, a third damage type should exist',
      );
    assert
      .dom('#nav-attacks [data-test-input-damage="3"]')
      .doesNotExist(
        'after a second add damage type, a fourth damage type should exist',
      );

    // Customize the damage type dropdown for the newly added damage type
    await select(
      '#nav-attacks [data-test-damage-dropdown="2"]',
      DamageType.BLUDGEONING.name,
    );
    assert
      .dom('#nav-attacks [data-test-damage-dropdown="0"]')
      .hasValue(
        DamageType.PIERCING.name,
        'damage 0 should be piercing (by default)',
      );
    assert
      .dom('#nav-attacks [data-test-damage-dropdown="1"]')
      .hasValue(
        DamageType.FIRE.name,
        'damage 1 should be fire (after the dropdown reset the value)',
      );
    assert
      .dom('#nav-attacks [data-test-damage-dropdown="2"]')
      .hasValue(
        DamageType.BLUDGEONING.name,
        'damage 2 should be bludgeoning (after the dropdown reset the value)',
      );

    // Remove the radiant damage
    await click('#nav-attacks [data-test-button-remove-damage-type="1"]');

    assert
      .dom('#nav-attacks [data-test-input-damage="0"]')
      .exists('after add x2 and remove x1, one damage type should exist');
    assert
      .dom('#nav-attacks [data-test-damage-dropdown="0"]')
      .hasValue(
        DamageType.PIERCING.name,
        'piercing damage should not have been removed',
      );
    assert
      .dom('#nav-attacks [data-test-input-damage="1"]')
      .exists('after add x2 and remove x1, a second damage type should exist');
    assert
      .dom('#nav-attacks [data-test-damage-dropdown="1"]')
      .hasValue(
        DamageType.BLUDGEONING.name,
        'bludgeoning damage should not have been removed',
      );
    assert
      .dom('#nav-attacks [data-test-input-damage="2"]')
      .doesNotExist(
        'after add x2 and remove x1, a third damage type should not exist',
      );
  });

  test('clearing the attack log', async function (this: ElementContext, assert) {
    await visit('/');

    // Attack (using the default setup)
    await click('#nav-attacks [data-test-button-getDamage]');

    // There should be one set of attack details displayed
    assert
      .dom('#nav-attacks [data-test-data-list="0"]')
      .exists('details should be displayed for one attack');
    assert
      .dom('#nav-attacks [data-test-data-list="1"]')
      .doesNotExist('only one attack set should be displayed');

    // Attack twice more
    await click('#nav-attacks [data-test-button-getDamage]');
    await click('#nav-attacks [data-test-button-getDamage]');

    // There should be three sets of attack details displayed
    assert
      .dom('#nav-attacks [data-test-data-list="0"]')
      .exists('details should be displayed for one attack');
    assert
      .dom('#nav-attacks [data-test-data-list="1"]')
      .exists('details should be displayed for two attacks');
    assert
      .dom('#nav-attacks [data-test-data-list="2"]')
      .exists('details should be displayed for three attacks');
    assert
      .dom('#nav-attacks [data-test-data-list="3"]')
      .doesNotExist('details should not be displayed for a fourth attack');

    // Clear the attack log
    await click('#nav-attacks [data-test-button-clear-log]');

    // No attack details should be displayed
    assert
      .dom('#nav-attacks [data-test-data-list="0"]')
      .doesNotExist('details should no longer be displayed');

    // Clicking again should not cause any errors
    await click('#nav-attacks [data-test-button-clear-log]');
  });

  test('invalidating malformatted fields', async function (this: ElementContext, assert) {
    await visit('/');
    // numberOfAttacks
    await fillIn('#nav-attacks [data-test-input-numberOfAttacks]', '8');
    assert
      .dom('#nav-attacks [data-test-input-numberOfAttacks]')
      .isValid('initial number of attacks should be valid');

    await fillIn('#nav-attacks [data-test-input-numberOfAttacks]', '-2');
    assert
      .dom('#nav-attacks [data-test-input-numberOfAttacks]')
      .isNotValid('invalid input number of attacks should be flagged');

    // toHit
    await fillIn('#nav-attacks [data-test-input-toHit]', '3 - 1d6');
    assert
      .dom('#nav-attacks [data-test-input-toHit]')
      .isValid('initial toHit should be valid');

    await fillIn('#nav-attacks [data-test-input-toHit]', 'invalid');
    assert
      .dom('#nav-attacks [data-test-input-toHit]')
      .isNotValid('invalid input toHit should be flagged');
  });
});
