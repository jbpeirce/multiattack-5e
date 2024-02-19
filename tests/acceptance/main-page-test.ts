import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import type { ElementContext } from '../types/element-context';

module('Acceptance | main page', function (hooks) {
  setupApplicationTest(hooks);

  test('visiting /', async function (assert) {
    await visit('/');

    assert.strictEqual(
      currentURL(),
      '/',
      'should have navigated to the root url',
    );

    // Check for the expected header
    assert
      .dom('h1')
      .hasText('Repeated Attack Simulator', 'page title should be displayed');
  });

  test('switching between tabs', async function (assert) {
    await visit('/');

    // Switch to the form for attacks
    await click('[data-test-button-attackTab]');
    await delay();
    assert
      .dom('#nav-attacks [data-test-attack-form-label]')
      .isVisible(
        'attack form label should be displayed after initial attack-tab click',
      );
    assert
      .dom('[data-test-save-form-label]')
      .isNotVisible(
        'save form label should not be displayed after initial attack-tab click',
      );

    // Switch to the form for saves
    await click('[data-test-button-saveTab]');
    await delay();

    assert
      .dom('[data-test-attack-form-label]')
      .isNotVisible('attack form label should not be displayed');
    assert
      .dom('[data-test-save-form-label]')
      .isVisible('save form label should be displayed');

    // Switch back to the form for attacks
    await click('[data-test-button-attackTab]');
    await delay();

    assert
      .dom('[data-test-attack-form-label]')
      .isVisible(
        'attack form label should be displayed after second attack-tab click',
      );
    assert
      .dom('[data-test-save-form-label]')
      .isNotVisible(
        'save form label should not be displayed after second attack-tab click',
      );
  });

  test('it retains the state of each tab when switched away', async function (this: ElementContext, assert) {
    await visit('/');

    // Switch to the attack form to make sure the state is as expected
    await click('[data-test-button-attackTab]');
    await delay();
    assert
      .dom('[data-test-attack-form-label]')
      .isVisible('attack form label should be displayed');

    // Trigger two attacks (with the default configuration)
    await click('[data-test-button-getDamage]');
    await click('[data-test-button-getDamage]');

    // Check and save the first damage header
    assert
      .dom('#nav-attacks [data-test-total-damage-header="0"]')
      .isVisible('data from the first set of attacks should be displayed')
      .containsText(
        'Total Damage',
        'the damage header should match expectations',
      );
    const firstAttackDamageHeader = this.element.querySelector(
      '#nav-attacks [data-test-total-damage-header="0"]',
    )!.textContent!;

    // Check and save the second damage header
    assert
      .dom('#nav-attacks [data-test-total-damage-header="1"]')
      .isVisible('data from the second set of attacks should be displayed')
      .containsText(
        'Total Damage',
        'the damage header should match expectations',
      );
    const secondAttackDamageHeader = this.element.querySelector(
      '#nav-attacks [data-test-total-damage-header="1"]',
    )!.textContent!;

    // Switch to the form for saves
    await click('[data-test-button-saveTab]');
    await delay();
    assert
      .dom('[data-test-save-form-label]')
      .isVisible('save form label should be displayed');

    // Trigger one save
    await click('[data-test-button-rollSaves]');

    // One set of saves should be displayed in the detail pane
    // Check and save the first damage header
    assert
      .dom('#nav-saves [data-test-total-damage-header="0"]')
      .isVisible('data from the first set of saves should be displayed')
      .containsText(
        'Total Damage',
        'the damage header should match expectations',
      );
    const firstSaveDamageHeader = this.element.querySelector(
      '#nav-saves [data-test-total-damage-header="0"]',
    )!.textContent!;

    assert.notEqual(
      firstAttackDamageHeader,
      firstSaveDamageHeader,
      'attack damage and save damage headers should not match',
    );

    // Switch back to the form for attacks
    await click('[data-test-button-attackTab]');
    await delay();
    assert
      .dom('[data-test-attack-form-label]')
      .isVisible('attack form label should be displayed');

    // Two sets of attacks should still be displayed in the detail pane
    assert
      .dom('#nav-attacks [data-test-total-damage-header="0"]')
      .hasText(
        firstAttackDamageHeader,
        'first attack damage header should still be present',
      );
    assert
      .dom('#nav-attacks [data-test-total-damage-header="1"]')
      .hasText(
        secondAttackDamageHeader,
        'second attack damage header should still be present',
      );
  });

  function delay() {
    return new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  }
});
