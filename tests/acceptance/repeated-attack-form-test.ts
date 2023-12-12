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
      .dom('h2')
      .hasText(
        'Set Up Current Attacks',
        'current attack heading should be displayed',
      );
    assert
      .dom('h3')
      .hasText(
        'Enter Attack Details',
        'attack details heading should be displayed',
      );
    assert
      .dom('h4')
      .hasText(
        'Attack Details',
        'current attack details heading should be displayed',
      );
  });

  test('displaying attack details', async function (assert) {
    await visit('/');

    // Fill in some details for the attack
    await fillIn('[data-test-input-numberOfAttacks]', '8');
    await fillIn('[data-test-input-targetAC]', '15');
    await fillIn('[data-test-input-toHit]', '3 - 1d6');
    await fillIn('[data-test-input-damage="0"]', '2d6 + 3');

    // The description should have been updated
    assert
      .dom('[data-test-plan-detail-list]')
      .hasText(
        'Target AC: 15\n' +
          'Number of attacks: 8\n' +
          'Attack roll: 1d20 + 3 - 1d6\n' +
          'Attack damage: 2d6 + 3 piercing damage',
        'the details for the input damage should be displayed',
      );
  });

  test('getting attack information', async function (this: ElementContext, assert) {
    await visit('/');

    // Fill in some details for the attack
    await fillIn('[data-test-input-numberOfAttacks]', '8');
    await fillIn('[data-test-input-targetAC]', '15');
    await fillIn('[data-test-input-toHit]', '3 - 1D6');
    await fillIn('[data-test-input-damage="0"]', '2d6 + 5');
    await select('[data-test-damage-dropdown="0"]', DamageType.RADIANT.name);
    await click('[data-test-value="advantage"]');
    await click('[data-test-value="disadvantage"]');
    await click('[data-test-input-resistant="0"]');

    assert
      .dom('[data-test-plan-detail-list]')
      .hasText(
        'Target AC: 15\n' +
          'Number of attacks: 8\n' +
          'Attack roll: 1d20 + 3 - 1D6\n' +
          '(rolls with disadvantage)\n' +
          'Attack damage: 2d6 + 5 radiant damage\n' +
          '(target resistant)',
        'the details for the input damage should be displayed',
      );

    assert
      .dom('[data-test-total-damage-header]')
      .isNotVisible(
        'damage header should not be displayed before the attack has been requested',
      );

    assert
      .dom('[data-test-attack-detail-list]')
      .isNotVisible(
        'attack detail list should not be displayed before the attack has been requested',
      );

    // Calculate the attack
    await click('[data-test-button-getDamage]');

    assert
      .dom('[data-test-total-damage-header]')
      .isVisible('damage header should be displayed');

    assert
      .dom('[data-test-total-damage-header]')
      .hasTextContaining('*** Total Damage');

    assert
      .dom('[data-test-attack-detail-list]')
      .isVisible('attack details should be displayed');

    assert.equal(
      this.element.querySelector('[data-test-attack-detail-list]')?.children
        .length,
      8,
      '8 attacks should have been displayed',
    );
  });

  test('adding and removing damage types', async function (assert) {
    await visit('/');

    // Initially, there should be one damage type displayed
    assert
      .dom('[data-test-input-damage="0"]')
      .exists('one damage type should exist');
    assert
      .dom('[data-test-input-damage="1"]')
      .doesNotExist('only one damage type should exist');
    assert
      .dom('[data-test-damage-dropdown="0"]')
      .hasValue(
        DamageType.PIERCING.name,
        'damage 0 should be piercing (by default)',
      );

    // Add another damage type
    await click('[data-test-button-add-damage-type]');

    assert
      .dom('[data-test-input-damage="0"]')
      .exists('after add damage type, one damage type should exist');
    assert
      .dom('[data-test-input-damage="1"]')
      .exists('after add damage type, a second damage type should exist');
    assert
      .dom('[data-test-input-damage="2"]')
      .doesNotExist('after add damage type, a third damage type should exist');

    // Customize the damage type dropdown for the newly added damage type
    await select('[data-test-damage-dropdown="1"]', DamageType.FIRE.name);
    assert
      .dom('[data-test-damage-dropdown="0"]')
      .hasValue(
        DamageType.PIERCING.name,
        'damage 0 should be piercing (by default)',
      );
    assert
      .dom('[data-test-damage-dropdown="1"]')
      .hasValue(
        DamageType.FIRE.name,
        'damage 1 should be fire (after the dropdown reset the value)',
      );

    // Add a third damage type
    await click('[data-test-button-add-damage-type]');

    assert
      .dom('[data-test-input-damage="0"]')
      .exists('after a second add damage type, one damage type should exist');
    assert
      .dom('[data-test-input-damage="1"]')
      .exists(
        'after a second add damage type, a second damage type should exist',
      );
    assert
      .dom('[data-test-input-damage="2"]')
      .exists(
        'after a second add damage type, a third damage type should exist',
      );
    assert
      .dom('[data-test-input-damage="3"]')
      .doesNotExist(
        'after a second add damage type, a fourth damage type should exist',
      );

    // Customize the damage type dropdown for the newly added damage type
    await select(
      '[data-test-damage-dropdown="2"]',
      DamageType.BLUDGEONING.name,
    );
    assert
      .dom('[data-test-damage-dropdown="0"]')
      .hasValue(
        DamageType.PIERCING.name,
        'damage 0 should be piercing (by default)',
      );
    assert
      .dom('[data-test-damage-dropdown="1"]')
      .hasValue(
        DamageType.FIRE.name,
        'damage 1 should be fire (after the dropdown reset the value)',
      );
    assert
      .dom('[data-test-damage-dropdown="2"]')
      .hasValue(
        DamageType.BLUDGEONING.name,
        'damage 2 should be bludgeoning (after the dropdown reset the value)',
      );

    // Remove the radiant damage
    await click('[data-test-button-remove-damage-type="1"]');

    assert
      .dom('[data-test-input-damage="0"]')
      .exists('after add x2 and remove x1, one damage type should exist');
    assert
      .dom('[data-test-damage-dropdown="0"]')
      .hasValue(
        DamageType.PIERCING.name,
        'piercing damage should not have been removed',
      );
    assert
      .dom('[data-test-input-damage="1"]')
      .exists('after add x2 and remove x1, a second damage type should exist');
    assert
      .dom('[data-test-damage-dropdown="1"]')
      .hasValue(
        DamageType.BLUDGEONING.name,
        'bludgeoning damage should not have been removed',
      );
    assert
      .dom('[data-test-input-damage="2"]')
      .doesNotExist(
        'after add x2 and remove x1, a third damage type should not exist',
      );
  });

  test('invalidating malformatted fields', async function (this: ElementContext, assert) {
    await visit('/');

    // numberOfAttacks
    await fillIn('[data-test-input-numberOfAttacks]', '8');
    assert
      .dom('[data-test-input-numberOfAttacks]')
      .isValid('initial number of attacks should be valid');

    await fillIn('[data-test-input-numberOfAttacks]', '-2');
    assert
      .dom('[data-test-input-numberOfAttacks]')
      .isNotValid('invalid input number of attacks should be flagged');

    // toHit
    await fillIn('[data-test-input-toHit]', '3 - 1d6');
    assert
      .dom('[data-test-input-toHit]')
      .isValid('initial toHit should be valid');

    await fillIn('[data-test-input-toHit]', 'invalid');
    assert
      .dom('[data-test-input-toHit]')
      .isNotValid('invalid input toHit should be flagged');
  });
});
