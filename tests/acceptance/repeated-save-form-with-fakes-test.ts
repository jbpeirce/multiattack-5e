import { click, fillIn, select, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { fake } from 'sinon';

import DamageType from 'multiattack-5e/components/damage-type-enum';
import type RandomnessService from 'multiattack-5e/services/randomness';

import { stubReturning } from '../helpers/dice-helper';
import { type ElementContext } from '../types/element-context';

module('Acceptance | repeated save form with fake dice', function (hooks) {
  setupApplicationTest(hooks);

  test('it displays a passed save with maximized dice', async function (this: ElementContext, assert) {
    // Mock randomness so that all dice roll their maximum value
    const fakeRandom = fake.returns(0.99999999999999);
    const random = this.owner.lookup('service:randomness') as RandomnessService;
    random.random = fakeRandom;

    await visit('/');
    await click('[data-test-button-saveTab]');
    await delay();

    // Fill in some details for the saves
    await fillIn('#nav-saves [data-test-input-numberOfSaves]', '1');
    await fillIn('#nav-saves [data-test-input-saveDC]', '14');
    await fillIn('#nav-saves [data-test-input-saveMod]', '-1D4');
    await fillIn('#nav-saves [data-test-input-damage="0"]', '2d6');
    await click('#nav-saves [data-test-input-passedSave-noDamage]');

    // Roll the saves
    await click('#nav-saves [data-test-button-rollSaves]');

    assert
      .dom('#nav-saves [data-test-data-list="0"]')
      .hasText(
        'Number of saves: 1\nSave DC: 14\nSaving throw: 1d20 - 1d4\n',
        'the details for the set of saves should be displayed',
      );

    // Since save-for-half was not checked, this save inflicts 0 damage
    assert
      .dom('#nav-saves [data-test-total-damage-header="0"]')
      .hasText('Total Damage: 0 (1 pass)');

    // Examine the saving throw details
    const detailsList = this.element.querySelector(
      '[data-test-detail-list="0"]',
    )!.children;

    assert.strictEqual(
      detailsList[0]?.className,
      'li-success',
      'saving throw should have bullet point formatted as a success',
    );

    // Check the saving throw text
    assert
      .dom(`#nav-saves [data-test-roll-detail="0-0"]`)
      .hasAttribute('title', '1d20: 20 | -1d4: 4')
      .hasText('16 to save');

    // Test the collapsible saving throw details
    assert
      .dom(`#nav-saves [data-test-roll-collapse-link="0-0"]`)
      .hasAria('expanded', 'false')
      .hasText('16');
    assert
      .dom(`#nav-saves [data-test-roll-collapse-pane="0-0"]`)
      .hasText('1d20: 20 -1d4: 4')
      .doesNotHaveClass(
        'show',
        'saving throw detail pane should start collapsed',
      );

    // The saving throw roll details should be visible after a click
    await click(`#nav-saves [data-test-roll-collapse-link="0-0"]`);
    // Delay briefly so that the pane finishes opening
    await delay();
    assert
      .dom(`#nav-saves [data-test-roll-collapse-link="0-0"]`)
      .hasAria(
        'expanded',
        'true',
        'after click, saving throw roll detail pane should be expanded',
      );
    assert
      .dom(`#nav-saves [data-test-roll-collapse-pane="0-0"]`)
      .hasClass(
        'show',
        'after click, saving throw roll detail pane should be visible',
      );

    // Do not test closing the pane; some sort of state appears to persist in
    // Bootstrap between tests, and makes closing the pane fail after the
    // first test that renders this form.
  });

  test('it displays a set of failed saves with minimized dice', async function (this: ElementContext, assert) {
    // Mock randomness so that all dice roll their minimum value
    const fakeRandom = fake.returns(0);
    const random = this.owner.lookup('service:randomness') as RandomnessService;
    random.random = fakeRandom;

    await visit('/');
    await click('[data-test-button-saveTab]');
    await delay();

    // Fill in some details for the saves
    await fillIn('#nav-saves [data-test-input-numberOfSaves]', '3');
    await fillIn('#nav-saves [data-test-input-saveDC]', '14');
    await fillIn('#nav-saves [data-test-input-saveMod]', '1d6+3');
    await fillIn('#nav-saves [data-test-input-damage="0"]', '2d6');
    await select(
      '#nav-saves [data-test-damage-dropdown="0"]',
      DamageType.COLD.name,
    );
    await click('#nav-saves [data-test-input-passedSave-noDamage]');

    // Roll the saves
    await click('#nav-saves [data-test-button-rollSaves]');

    assert
      .dom('#nav-saves [data-test-data-list="0"]')
      .hasText(
        'Number of saves: 3\nSave DC: 14\nSaving throw: 1d20 + 1d6 + 3\n',
        'the details for the set of saves should be displayed',
      );

    // All three saves failed, inflicting full damage but with minimized dice
    assert
      .dom('#nav-saves [data-test-total-damage-header="0"]')
      .hasText('Total Damage: 6 (0 passes)');

    // Check that the displayed text matches the expected die rolls. Since all
    // dice are minimized, the three saves are identical.
    const detailsList = this.element.querySelector(
      '[data-test-detail-list="0"]',
    )!.children;

    for (let i = 0; i < 3; i++) {
      assert.strictEqual(
        detailsList[i]?.className,
        'li-fail',
        'saving throw should have bullet point formatted as a failure',
      );

      // Examine the saving throw text
      assert
        .dom(`#nav-saves [data-test-roll-detail="0-${i}"]`)
        .hasAttribute('title', '1d20: 1 | 1d6: 1')
        .hasText('5 to save');

      // Examine the damage section
      assert
        .dom(`#nav-saves [data-test-damage-roll-detail="0-${i}-0"]`)
        .hasAttribute('title', '2d6: 1, 1')
        .hasText('2 cold damage (2d6)');

      // Test the collapsible damage pane
      assert
        .dom(`#nav-saves [data-test-damage-roll-collapse-link="0-${i}-0"]`)
        .hasAria('expanded', 'false')
        .hasText('2');
      assert
        .dom(`#nav-saves [data-test-damage-roll-collapse-pane="0-${i}-0"]`)
        .hasText('2d6: 1, 1')
        .doesNotHaveClass(
          'show',
          'damage roll detail pane should start collapsed',
        );

      // The damage roll details should be visible after a click
      await click(
        `#nav-saves [data-test-damage-roll-collapse-link="0-${i}-0"]`,
      );
      // Delay briefly so that the pane finishes opening
      await delay();
      assert
        .dom(`#nav-saves [data-test-damage-roll-collapse-link="0-${i}-0"]`)
        .hasAria(
          'expanded',
          'true',
          'after click, damage roll detail pane should be expanded',
        );
      assert
        .dom(`#nav-saves [data-test-damage-roll-collapse-pane="0-${i}-0"]`)
        .hasClass(
          'show',
          'after click, damage roll detail pane should be visible',
        );

      // Do not test closing the pane; some sort of state appears to persist in
      // Bootstrap between tests, and makes closing the pane fail after the
      // first test that renders this form.
    }
  });

  test('it displays saves with re-rolled dice', async function (this: ElementContext, assert) {
    // Mock randomness so that dice switch from maximum to minimum values
    const fakeRandom = stubReturning(
      0.99999999999999, // first uncached damage roll, used
      0.99999999999999, // first d20 roll, roll 1, used
      0.99999999999999, // first d20 roll, roll 2, ignored
      0.5, // second uncached damage roll, used
      0, // second d20 roll, roll 1, used
      0, // second d20 roll, roll 2, ignored
    );
    const random = this.owner.lookup('service:randomness') as RandomnessService;
    random.random = fakeRandom;

    await visit('/');
    await click('[data-test-button-saveTab]');
    await delay();

    // Fill in some details for the saves
    await fillIn('#nav-saves [data-test-input-numberOfSaves]', '2');
    await fillIn('#nav-saves [data-test-input-saveDC]', '14');
    await fillIn('#nav-saves [data-test-input-saveMod]', '-2');
    await fillIn('#nav-saves [data-test-input-damage="0"]', '1d8');
    await click('#nav-saves [data-test-input-roll-dmg-every-save]');

    // Switch away from the default half-damage passed-save behavior, then back to it
    await click('#nav-saves [data-test-input-passedSave-noDamage]');
    await click('#nav-saves [data-test-input-passedSave-halfDamage]');

    // Roll the saves
    await click('#nav-saves [data-test-button-rollSaves]');

    assert
      .dom('#nav-saves [data-test-data-list="0"]')
      .hasText(
        'Number of saves: 2\nSave DC: 14\nSaving throw: 1d20 - 2\n',
        'the details for the set of saves should be displayed',
      );

    // Since save-for-half was checked, both saves inflicted damage
    assert
      .dom('#nav-saves [data-test-total-damage-header="0"]')
      .hasText(
        'Total Damage: 9 (1 pass)',
        '4 + 5 damage should have been inflicted',
      );

    const detailsList = this.element.querySelector(
      '[data-test-detail-list="0"]',
    )!.children;

    // Examine the first saving throw details
    assert.strictEqual(
      detailsList[0]?.className,
      'li-success',
      'saving throw should have bullet point formatted as a success',
    );

    // Check the saving throw text
    assert
      .dom(`#nav-saves [data-test-roll-detail="0-0"]`)
      .hasAttribute('title', '1d20: 20')
      .hasText('18 to save');

    // Examine the damage section
    assert
      .dom(`#nav-saves [data-test-damage-roll-detail="0-0-0"]`)
      .hasAttribute('title', '1d8: 8')
      .hasText(
        '4 fire damage (1d8) (halved)',
        'newly-rolled maximized damage should have been halved by a passed save',
      );

    // Examine the second saving throw details
    assert.strictEqual(
      detailsList[1]?.className,
      'li-fail',
      'saving throw should have bullet point formatted as a failure',
    );

    // Check the saving throw text
    assert
      .dom(`#nav-saves [data-test-roll-detail="0-1"]`)
      .hasAttribute('title', '1d20: 1')
      .hasText('-1 to save');

    // Examine the damage section
    assert
      .dom(`#nav-saves [data-test-damage-roll-detail="0-1-0"]`)
      .hasAttribute('title', '1d8: 5')
      .hasText(
        '5 fire damage (1d8)',
        'new-rolled half+ damage should have been inflicted on the failed save',
      );
  });

  test('it handles resistance and vulnerability', async function (this: ElementContext, assert) {
    // Mock randomness so that dice roll minimum values
    let fakeRandom = fake.returns(0);
    let random = this.owner.lookup('service:randomness') as RandomnessService;
    random.random = fakeRandom;

    await visit('/');
    await click('[data-test-button-saveTab]');
    await delay();

    // Fill in some details for the saves
    await fillIn('#nav-saves [data-test-input-numberOfSaves]', '1');
    await fillIn('#nav-saves [data-test-input-saveDC]', '14');
    await fillIn('#nav-saves [data-test-input-saveMod]', '0');
    await fillIn('#nav-saves [data-test-input-damage="0"]', '1d8 + 1');
    await select(
      '#nav-saves [data-test-damage-dropdown="0"]',
      DamageType.FIRE.name,
    );

    // Configure the damage to be resisted
    await click('#nav-saves [data-test-input-resistant="0"]');

    // Roll the saves
    await click('#nav-saves [data-test-button-rollSaves]');

    // Change the randomness to roll maximum on all dice
    fakeRandom = fake.returns(0.99999999999);
    random = this.owner.lookup('service:randomness') as RandomnessService;
    random.random = fakeRandom;

    // Add vulnerability
    await click('#nav-saves [data-test-input-vulnerable="0"]');

    // Roll a second set of saves
    await click('#nav-saves [data-test-button-rollSaves]');

    // Remove damage resistance
    await click('#nav-saves [data-test-input-resistant="0"]');

    // Roll a third set of saves
    await click('#nav-saves [data-test-button-rollSaves]');

    // Most recent save: vulnerability and half-damage only
    assert
      .dom(`#nav-saves [data-test-damage-roll-detail="0-0-0"]`)
      .hasAttribute('title', '1d8: 8')
      .hasText(
        '8 fire damage (1d8 + 1) (halved) (vulnerable)',
        'first save should be marked as vulnerable with half-damage',
      );

    // Second save: resistance, vulnerability, and half damage
    assert
      .dom(`#nav-saves [data-test-damage-roll-detail="1-0-0"]`)
      .hasAttribute('title', '1d8: 8')
      .hasText(
        '4 fire damage (1d8 + 1) (halved) (resisted) (vulnerable)',
        'second save should be marked as both resistant and vulnerable with half-damage',
      );

    // Third save: resistance and minimized dice
    assert
      .dom(`#nav-saves [data-test-damage-roll-detail="2-0-0"]`)
      .hasAttribute('title', '1d8: 1')
      .hasText(
        '1 fire damage (1d8 + 1) (resisted)',
        'third save should be marked as resisted with minimized dice',
      );
  });

  test('it handles advantage', async function (this: ElementContext, assert) {
    // Mock randomness so that dice switch from maximum to minimum values
    const fakeRandom = stubReturning(
      0.99999999999999, // first uncached damage roll, used
      0, // first d20 roll, roll 1, ignored
      0.99999999999999, // first d20 roll, roll 2, used
      0.5, // second uncached damage roll, used
      0.1, // second d20 roll, roll 1, used
      0, // second d20 roll, roll 2, ignored
    );
    const random = this.owner.lookup('service:randomness') as RandomnessService;
    random.random = fakeRandom;

    await visit('/');
    await click('[data-test-button-saveTab]');
    await delay();

    // Fill in some details for the saves
    await fillIn('#nav-saves [data-test-input-numberOfSaves]', '2');
    await fillIn('#nav-saves [data-test-input-saveDC]', '14');
    await fillIn('#nav-saves [data-test-input-saveMod]', '-2');
    await fillIn('#nav-saves [data-test-input-damage="0"]', '1d8');
    await click('#nav-saves [data-test-input-roll-dmg-every-save]');
    await click('#nav-saves [data-test-value="advantage"]');

    // Roll the saves
    await click('#nav-saves [data-test-button-rollSaves]');

    assert
      .dom('#nav-saves [data-test-data-list="0"]')
      .hasText(
        'Number of saves: 2\nSave DC: 14\nSaving throw: 1d20 - 2 (advantage)\n',
        'the details for the set of saves should be displayed',
      );

    // Since save-for-half was checked, both saves inflicted damage
    assert
      .dom('#nav-saves [data-test-total-damage-header="0"]')
      .hasText(
        'Total Damage: 9 (1 pass)',
        '4 + 5 damage should have been inflicted',
      );

    const detailsList = this.element.querySelector(
      '[data-test-detail-list="0"]',
    )!.children;

    // Examine the first saving throw details
    assert.strictEqual(
      detailsList[0]?.className,
      'li-success',
      'saving throw should have bullet point formatted as a success',
    );

    // Check the saving throw text
    assert
      .dom(`#nav-saves [data-test-roll-detail="0-0"]`)
      .hasAttribute('title', '1d20: 1, 20')
      .hasText(
        '18 to save',
        'the larger roll should have been chosen for a roll with advantage',
      );

    // Examine the damage section
    assert
      .dom(`#nav-saves [data-test-damage-roll-detail="0-0-0"]`)
      .hasAttribute('title', '1d8: 8')
      .hasText(
        '4 fire damage (1d8) (halved)',
        'newly-rolled maximized damage should have been halved by a passed save',
      );

    // Examine the second saving throw details
    assert.strictEqual(
      detailsList[1]?.className,
      'li-fail',
      'saving throw should have bullet point formatted as a failure',
    );

    // Check the saving throw text
    assert
      .dom(`#nav-saves [data-test-roll-detail="0-1"]`)
      .hasAttribute('title', '1d20: 3, 1')
      .hasText('1 to save', 'the larger roll should have been chosen');

    // Examine the damage section
    assert
      .dom(`#nav-saves [data-test-damage-roll-detail="0-1-0"]`)
      .hasAttribute('title', '1d8: 5')
      .hasText(
        '5 fire damage (1d8)',
        'new-rolled half+ damage should have been inflicted on the failed save',
      );
  });

  test('it handles disadvantage', async function (this: ElementContext, assert) {
    // Mock randomness so that dice switch from maximum to minimum values
    const fakeRandom = stubReturning(
      0.99999999999999, // first uncached damage roll, ignored
      0.8, // first d20 roll, roll 1, used
      0.99999999999999, // first d20 roll, roll 2, used
      0.5, // second uncached damage roll, used
      0.99999999999999, // second d20 roll, roll 1, ignored
      0, // second d20 roll, roll 2, used
    );
    const random = this.owner.lookup('service:randomness') as RandomnessService;
    random.random = fakeRandom;

    await visit('/');
    await click('[data-test-button-saveTab]');
    await delay();

    // Fill in some details for the saves
    await fillIn('#nav-saves [data-test-input-numberOfSaves]', '2');
    await fillIn('#nav-saves [data-test-input-saveDC]', '14');
    await fillIn('#nav-saves [data-test-input-saveMod]', '-2');
    await fillIn('#nav-saves [data-test-input-damage="0"]', '1d8');
    await click('#nav-saves [data-test-input-roll-dmg-every-save]');
    await click('#nav-saves [data-test-value="disadvantage"]');

    // Roll the saves
    await click('#nav-saves [data-test-button-rollSaves]');

    assert
      .dom('#nav-saves [data-test-data-list="0"]')
      .hasText(
        'Number of saves: 2\nSave DC: 14\nSaving throw: 1d20 - 2 (disadvantage)\n',
        'the details for the set of saves should be displayed',
      );

    // Since save-for-half was checked, both saves inflicted damage
    assert
      .dom('#nav-saves [data-test-total-damage-header="0"]')
      .hasText(
        'Total Damage: 9 (1 pass)',
        '4 + 5 damage should have been inflicted',
      );

    const detailsList = this.element.querySelector(
      '[data-test-detail-list="0"]',
    )!.children;

    // Examine the first saving throw details
    assert.strictEqual(
      detailsList[0]?.className,
      'li-success',
      'saving throw should have bullet point formatted as a failure',
    );

    // Check the saving throw text
    assert
      .dom(`#nav-saves [data-test-roll-detail="0-0"]`)
      .hasAttribute('title', '1d20: 17, 20')
      .hasText(
        '15 to save',
        'the smaller roll should have been chosen for a roll with disadvantage',
      );

    // Examine the damage section
    assert
      .dom(`#nav-saves [data-test-damage-roll-detail="0-0-0"]`)
      .hasAttribute('title', '1d8: 8')
      .hasText(
        '4 fire damage (1d8) (halved)',
        'newly-rolled maximized damage should have been halved by a passed save',
      );

    // Examine the second saving throw details
    assert.strictEqual(
      detailsList[1]?.className,
      'li-fail',
      'saving throw should have bullet point formatted as a failure',
    );

    // Check the saving throw text
    assert
      .dom(`#nav-saves [data-test-roll-detail="0-1"]`)
      .hasAttribute('title', '1d20: 20, 1')
      .hasText(
        '-1 to save',
        'the smaller roll should have been chosen for a save with disadvantage',
      );

    // Examine the damage section
    assert
      .dom(`#nav-saves [data-test-damage-roll-detail="0-1-0"]`)
      .hasAttribute('title', '1d8: 5')
      .hasText(
        '5 fire damage (1d8)',
        'new-rolled half+ damage should have been inflicted on the failed save',
      );
  });

  function delay() {
    return new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  }
});
