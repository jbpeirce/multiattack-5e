import { module, test } from 'qunit';
import { click, fillIn, visit, currentURL, select } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { ElementContext } from '../types/element-context';

module('Acceptance | repeated attack form', function (hooks) {
  setupApplicationTest(hooks);

  test('visiting /', async function (assert) {
    await visit('/');

    assert.strictEqual(
      currentURL(),
      '/',
      'should have navigated to the root url'
    );

    assert
      .dom('h2')
      .hasText(
        'Set Up Current Attacks',
        'current attack heading should be displayed'
      );
    assert
      .dom('h3')
      .hasText(
        'Enter Attack Details',
        'attack details heading should be displayed'
      );
    assert
      .dom('h4')
      .hasText(
        'Attack Details',
        'current attack details heading should be displayed'
      );
  });

  test('displaying attack details', async function (assert) {
    await visit('/');

    // Fill in some details for the attack
    await fillIn('[data-test-input-numberOfAttacks]', '8');
    await fillIn('[data-test-input-targetAC]', '15');
    await fillIn('[data-test-input-toHit]', '3 - 1d6');
    await fillIn('[data-test-input-damage]', '2d6 + 3');

    // The description should have been updated
    assert
      .dom('[data-test-plan-detail-list]')
      .hasText(
        'Target AC: 15\n' +
          'Number of attacks: 8\n' +
          'Attack roll: 1d20 + 3 - 1d6\n' +
          'Attack damage: 2d6 + 3 Piercing damage',
        'the details for the input damage should be displayed'
      );
  });

  test('getting attack information', async function (this: ElementContext, assert) {
    await visit('/');

    // Fill in some details for the attack
    await fillIn('[data-test-input-numberOfAttacks]', '8');
    await fillIn('[data-test-input-targetAC]', '15');
    await fillIn('[data-test-input-toHit]', '3 - 1d6');
    await fillIn('[data-test-input-damage]', '2d6 + 5');
    await select('[data-test-damage-dropdown]', '[data-test-damage-Acid]');
    await click('[data-test-value="advantage"]');
    await click('[data-test-value="disadvantage"]');
    await click('[data-test-input-resistant]');

    assert
      .dom('[data-test-plan-detail-list]')
      .hasText(
        'Target AC: 15\n' +
          'Number of attacks: 8\n' +
          'Attack roll: 1d20 + 3 - 1d6\n' +
          '(rolls with disadvantage)\n' +
          'Attack damage: 2d6 + 5 Acid damage\n' +
          '(target resistant)',
        'the details for the input damage should be displayed'
      );

    assert
      .dom('[data-test-total-damage-header]')
      .isNotVisible(
        'damage header should not be displayed before the attack has been requested'
      );

    assert
      .dom('[data-test-attack-detail-list]')
      .isNotVisible(
        'attack detail list should not be displayed before the attack has been requested'
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
      '8 attacks should have been displayed'
    );
  });

  test('it invalidates malformatted fields', async function (this: ElementContext, assert) {
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

    // damage
    await fillIn('[data-test-input-damage]', '2d6 + 3');
    assert
      .dom('[data-test-input-damage]')
      .isValid('initial damage should be valid');

    await fillIn('[data-test-input-damage]', 'invalid');
    assert
      .dom('[data-test-input-damage]')
      .isNotValid('invalid input damage should be flagged');
  });
});
