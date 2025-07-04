import { click, fillIn, select, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import DamageType from 'multiattack-5e/components/damage-type-enum';

import { type ElementContext } from '../types/element-context';

module('Acceptance | repeated save form', function (hooks) {
  setupApplicationTest(hooks);

  test('performing single set of saves', async function (this: ElementContext, assert) {
    await visit('/');
    await click('[data-test-button-saveTab]');

    // Fill in some details for the save
    await fillIn('#nav-saves [data-test-input-numberOfSaves]', '8');
    await fillIn('#nav-saves [data-test-input-saveDC]', '15');
    await fillIn('#nav-saves [data-test-input-saveMod]', '3 - 1D6');
    await fillIn('#nav-saves [data-test-input-damage="0"]', '4d8');
    await select(
      '#nav-saves [data-test-damage-dropdown="0"]',
      DamageType.RADIANT.name,
    );
    await click('#nav-saves [data-test-value="advantage"]');
    await click('#nav-saves [data-test-value="disadvantage"]');
    await click('#nav-saves [data-test-input-resistant="0"]');

    assert
      .dom('#nav-saves [data-test-total-damage-header="0"]')
      .isNotVisible(
        'damage header should not be displayed before the save has been requested',
      );

    // Execute the group of saves
    await click('#nav-saves [data-test-button-rollSaves]');

    assert
      .dom('#nav-saves [data-test-data-list="0"]')
      .hasText(
        'Number of saves: 8\n' +
          'Save DC: 15\n' +
          'Saving throw: 1d20 - 1d6 + 3 (disadvantage)\n',
        'the details for the set of saves should be displayed',
      );

    assert
      .dom('#nav-saves [data-test-total-damage-header="0"]')
      .isVisible('damage header should be displayed')
      .hasTextContaining('Total Damage');

    assert
      .dom('#nav-saves [data-test-detail-list="0"]')
      .isVisible('individual save details should be displayed');

    assert.strictEqual(
      this.element.querySelector('#nav-saves [data-test-detail-list="0"]')!
        .children.length,
      8,
      '8 saves should have been displayed',
    );
  });

  test('performing repeated sets of saves', async function (this: ElementContext, assert) {
    await visit('/');
    await click('[data-test-button-saveTab]');

    // Fill in some details for the saves
    await fillIn('#nav-saves [data-test-input-numberOfSaves]', '8');
    await fillIn('#nav-saves [data-test-input-saveDC]', '10');
    await fillIn('#nav-saves [data-test-input-saveMod]', '3 - 1d6');

    // Roll the saves
    await click('#nav-saves [data-test-button-rollSaves]');

    // Change some save details
    await fillIn('#nav-saves [data-test-input-numberOfSaves]', '4');
    await fillIn('#nav-saves [data-test-input-saveDC]', '15');
    await click('#nav-saves [data-test-value="advantage"]');
    await fillIn('#nav-saves [data-test-input-saveMod]', '3');

    // Roll saves again
    await click('#nav-saves [data-test-button-rollSaves]');

    // The second save should be displayed first
    assert
      .dom('#nav-saves [data-test-data-list="0"]')
      .hasText(
        'Number of saves: 4\n' +
          'Save DC: 15\n' +
          'Saving throw: 1d20 + 3 (advantage)\n',
        'the details for the second set of saves should be displayed',
      );

    assert
      .dom('#nav-saves [data-test-detail-list="0"]')
      .isVisible('save details should be displayed for the second save');

    assert.strictEqual(
      this.element.querySelector('#nav-saves [data-test-detail-list="0"]')!
        .children.length,
      4,
      '4 saves should have been displayed for the second set of saves',
    );

    // The first repeated save should still be visible
    assert
      .dom('#nav-saves [data-test-data-list="1"]')
      .hasText(
        'Number of saves: 8\n' +
          'Save DC: 10\n' +
          'Saving throw: 1d20 - 1d6 + 3\n',
        'the details for the first set of saves should be displayed',
      );

    assert
      .dom('#nav-saves [data-test-detail-list="1"]')
      .isVisible('save details should be displayed for the first save');

    assert.strictEqual(
      this.element.querySelector('#nav-saves [data-test-detail-list="1"]')!
        .children.length,
      8,
      '8 saves should have been displayed for the first set of saves',
    );
  });

  test('adding and removing damage types', async function (assert) {
    await visit('/');
    await click('[data-test-button-saveTab]');

    // Initially, there should be one damage type displayed
    assert
      .dom('#nav-saves [data-test-input-damage="0"]')
      .exists('one damage type should exist');
    assert
      .dom('#nav-saves [data-test-input-damage="1"]')
      .doesNotExist('only one damage type should exist');
    assert
      .dom('#nav-saves [data-test-damage-dropdown="0"]')
      .hasValue(DamageType.FIRE.name, 'damage 0 should be fire (by default)');

    // Add another damage type
    await click('#nav-saves [data-test-button-add-damage-type]');

    assert
      .dom('#nav-saves [data-test-input-damage="0"]')
      .exists('after add damage type, one damage type should exist');
    assert
      .dom('#nav-saves [data-test-input-damage="1"]')
      .exists('after add damage type, a second damage type should exist');
    assert
      .dom('#nav-saves [data-test-input-damage="2"]')
      .doesNotExist('after add damage type, a third damage type should exist');

    // Customize the damage type dropdown for the newly added damage type
    await select(
      '#nav-saves [data-test-damage-dropdown="1"]',
      DamageType.COLD.name,
    );
    assert
      .dom('#nav-saves [data-test-damage-dropdown="0"]')
      .hasValue(DamageType.FIRE.name, 'damage 0 should be fire (by default)');
    assert
      .dom('#nav-saves [data-test-damage-dropdown="1"]')
      .hasValue(
        DamageType.COLD.name,
        'damage 1 should be cold (after the dropdown reset the value)',
      );

    // Add a third damage type
    await click('#nav-saves [data-test-button-add-damage-type]');

    assert
      .dom('#nav-saves [data-test-input-damage="0"]')
      .exists('after a second add damage type, one damage type should exist');
    assert
      .dom('#nav-saves [data-test-input-damage="1"]')
      .exists(
        'after a second add damage type, a second damage type should exist',
      );
    assert
      .dom('#nav-saves [data-test-input-damage="2"]')
      .exists(
        'after a second add damage type, a third damage type should exist',
      );
    assert
      .dom('#nav-saves [data-test-input-damage="3"]')
      .doesNotExist(
        'after a second add damage type, a fourth damage type should exist',
      );

    // Customize the damage type dropdown for the newly added damage type
    await select(
      '#nav-saves [data-test-damage-dropdown="2"]',
      DamageType.BLUDGEONING.name,
    );
    assert
      .dom('#nav-saves [data-test-damage-dropdown="0"]')
      .hasValue(DamageType.FIRE.name, 'damage 0 should be fire (by default)');
    assert
      .dom('#nav-saves [data-test-damage-dropdown="1"]')
      .hasValue(
        DamageType.COLD.name,
        'damage 1 should be cold (after the dropdown reset the value)',
      );
    assert
      .dom('#nav-saves [data-test-damage-dropdown="2"]')
      .hasValue(
        DamageType.BLUDGEONING.name,
        'damage 2 should be bludgeoning (after the dropdown reset the value)',
      );

    // Remove the radiant damage
    await click('#nav-saves [data-test-button-remove-damage-type="1"]');

    assert
      .dom('#nav-saves [data-test-input-damage="0"]')
      .exists('after add x2 and remove x1, one damage type should exist');
    assert
      .dom('#nav-saves [data-test-damage-dropdown="0"]')
      .hasValue(
        DamageType.FIRE.name,
        'fire damage should not have been removed',
      );
    assert
      .dom('#nav-saves [data-test-input-damage="1"]')
      .exists('after add x2 and remove x1, a second damage type should exist');
    assert
      .dom('#nav-saves [data-test-damage-dropdown="1"]')
      .hasValue(
        DamageType.BLUDGEONING.name,
        'bludgeoning damage should not have been removed',
      );
    assert
      .dom('#nav-saves [data-test-input-damage="2"]')
      .doesNotExist(
        'after add x2 and remove x1, a third damage type should not exist',
      );
  });

  test('clearing the save log', async function (this: ElementContext, assert) {
    await visit('/');
    await click('[data-test-button-saveTab]');

    // Make a set of saves (using the default setup)
    await click('#nav-saves [data-test-button-rollSaves]');

    // There should be one set of save details displayed
    assert
      .dom('#nav-saves [data-test-data-list="0"]')
      .exists('details should be displayed for one set of saves');
    assert
      .dom('#nav-saves [data-test-data-list="1"]')
      .doesNotExist('only one save set should be displayed');

    // Roll saves twice more
    await click('#nav-saves [data-test-button-rollSaves]');
    await click('#nav-saves [data-test-button-rollSaves]');

    // There should be three sets of save details displayed
    assert
      .dom('#nav-saves [data-test-data-list="0"]')
      .exists('details should be displayed for one save');
    assert
      .dom('#nav-saves [data-test-data-list="1"]')
      .exists('details should be displayed for two saves');
    assert
      .dom('#nav-saves [data-test-data-list="2"]')
      .exists('details should be displayed for three saves');
    assert
      .dom('#nav-saves [data-test-data-list="3"]')
      .doesNotExist('details should not be displayed for a fourth save');

    // Clear the save log
    await click('#nav-saves [data-test-button-clear-log]');

    // No save details should be displayed
    assert
      .dom('#nav-saves [data-test-data-list="0"]')
      .doesNotExist('details should no longer be displayed');

    // Clicking again should not cause any errors
    await click('#nav-saves [data-test-button-clear-log]');
  });

  test('enabling and disabling evasion', async function (this: ElementContext, assert) {
    await visit('/');
    await click('[data-test-button-saveTab]');

    // Use mostly default values for the saves
    await fillIn('#nav-saves [data-test-input-numberOfSaves]', '8');
    await fillIn('#nav-saves [data-test-input-saveDC]', '15');
    await fillIn('#nav-saves [data-test-input-saveMod]', '3');

    // Check that the expected default damage behavior is selected
    assert
      .dom('#nav-saves [data-test-input-passedSave-halfDamage]')
      .isChecked();

    // Set evasion and verify that it is checked
    assert.dom('#nav-saves [data-test-input-target-has-evasion]').isEnabled();

    await click('#nav-saves [data-test-input-target-has-evasion]');

    assert
      .dom('#nav-saves [data-test-input-target-has-evasion]')
      .isEnabled()
      .isChecked();

    // Set no damage on passed saves
    await click('#nav-saves [data-test-input-passedSave-noDamage]');
    assert.dom('#nav-saves [data-test-input-passedSave-noDamage]').isChecked();
    assert
      .dom('#nav-saves [data-test-input-passedSave-halfDamage]')
      .isNotChecked();

    // Verify that evasion is un-checked and is disabled
    assert
      .dom('#nav-saves [data-test-input-target-has-evasion]')
      .isDisabled()
      .isNotChecked();

    // Set half damage on passed saves and check that evasion is reenabled (but not checked)
    await click('#nav-saves [data-test-input-passedSave-halfDamage]');
    assert
      .dom('#nav-saves [data-test-input-target-has-evasion]')
      .isEnabled()
      .isNotChecked();

    // Execute the group of saves
    await click('#nav-saves [data-test-button-rollSaves]');

    assert
      .dom('#nav-saves [data-test-data-list="0"]')
      .hasText(
        'Number of saves: 8\n' + 'Save DC: 15\n' + 'Saving throw: 1d20 + 3\n',
        'the details for the set of saves should be displayed',
      );

    assert
      .dom('#nav-saves [data-test-detail-list="0"]')
      .isVisible('individual save details should be displayed');

    assert.strictEqual(
      this.element.querySelector('#nav-saves [data-test-detail-list="0"]')!
        .children.length,
      8,
      '8 saves should have been displayed',
    );
  });

  test('invalidating malformatted fields', async function (this: ElementContext, assert) {
    await visit('/');
    await click('[data-test-button-saveTab]');

    // numberOfSaves
    await fillIn('#nav-saves [data-test-input-numberOfSaves]', '8');
    assert
      .dom('#nav-saves [data-test-input-numberOfSaves]')
      .isValid('initial number of saves should be valid');

    await fillIn('#nav-saves [data-test-input-numberOfSaves]', '-2');
    assert
      .dom('#nav-saves [data-test-input-numberOfSaves]')
      .isNotValid('invalid input number of saves should be flagged');

    // saveMod
    await fillIn('#nav-saves [data-test-input-saveMod]', '3 - 1d6');
    assert
      .dom('#nav-saves [data-test-input-saveMod]')
      .isValid('initial saveMod should be valid');

    await fillIn('#nav-saves [data-test-input-saveMod]', 'invalid');
    assert
      .dom('#nav-saves [data-test-input-saveMod]')
      .isNotValid('invalid input saveMod should be flagged');
  });
});
