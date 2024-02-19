import { click, fillIn, select, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import DamageType from 'multiattack-5e/components/damage-type-enum';
import type RandomnessService from 'multiattack-5e/services/randomness';

import { type ElementContext } from '../types/element-context';

module('Acceptance | repeated save form with fake dice', function (hooks) {
  setupApplicationTest(hooks);

  test('it displays a passed save with maximized dice', async function (this: ElementContext, assert) {
    // Mock randomness so that all dice roll their maximum value
    const fakeRandom = sinon.fake.returns(0.99999999999999);
    const random = this.owner.lookup('service:randomness') as RandomnessService;
    random.random = fakeRandom;

    await visit('/');

    // Fill in some details for the saves
    await fillIn('#nav-saves [data-test-input-numberOfSaves]', '1');
    await fillIn('#nav-saves [data-test-input-saveDC]', '14');
    await fillIn('#nav-saves [data-test-input-saveMod]', '-1D4');
    await fillIn('#nav-saves [data-test-input-damage="0"]', '2d6');

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
    const fakeRandom = sinon.fake.returns(0);
    const random = this.owner.lookup('service:randomness') as RandomnessService;
    random.random = fakeRandom;

    await visit('/');

    // Fill in some details for the saves
    await fillIn('#nav-saves [data-test-input-numberOfSaves]', '3');
    await fillIn('#nav-saves [data-test-input-saveDC]', '14');
    await fillIn('#nav-saves [data-test-input-saveMod]', '1d6+3');
    await fillIn('#nav-saves [data-test-input-damage="0"]', '2d6');
    await select(
      '#nav-saves [data-test-damage-dropdown="0"]',
      DamageType.COLD.name,
    );

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

  function delay() {
    return new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  }
});
