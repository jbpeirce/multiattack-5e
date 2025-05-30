import { click, fillIn, select, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { fake } from 'sinon';

import DamageType from 'multiattack-5e/components/damage-type-enum';
import type RandomnessService from 'multiattack-5e/services/randomness';

import { type ElementContext } from '../types/element-context';

module('Acceptance | repeated attack form with fake dice', function (hooks) {
  setupApplicationTest(hooks);

  test('it displays an attack set with maximized dice', async function (this: ElementContext, assert) {
    // Mock randomness so that all dice roll their maximum value
    const fakeRandom = fake.returns(0.99999999999999);
    const random = this.owner.lookup('service:randomness') as RandomnessService;
    random.random = fakeRandom;

    await visit('/');

    // Fill in some details for the attack
    await fillIn('#nav-attacks [data-test-input-numberOfAttacks]', '2');
    await fillIn('#nav-attacks [data-test-input-targetAC]', '15');
    await fillIn('#nav-attacks [data-test-input-toHit]', '3 - 1D6');
    await fillIn('#nav-attacks [data-test-input-damage="0"]', '1d12 + 5');
    await select(
      '#nav-attacks [data-test-damage-dropdown="0"]',
      DamageType.RADIANT.name,
    );
    await click('#nav-attacks [data-test-value="advantage"]');
    await click('#nav-attacks [data-test-value="straight"]');
    await click('#nav-attacks [data-test-input-resistant="0"]');

    // Calculate the attack
    await click('#nav-attacks [data-test-button-rollAttacks]');

    assert
      .dom('#nav-attacks [data-test-data-list="0"]')
      .hasText(
        'Number of attacks: 2\n' +
          'Target AC: 15\n' +
          'Attack roll: 1d20 - 1d6 + 3\n',
        'the details for the input damage should be displayed',
      );

    // Both attacks were a critical hit, so each dealt 12 + 12 + 5 = 29 damage,
    // halved to 14 by resistance
    assert
      .dom('#nav-attacks [data-test-total-damage-header="0"]')
      .hasText('Total Damage: 28 (2 hits)');

    // Check that the displayed text matches the expected die rolls. Since all
    // dice are maximized, the two attacks are identical.
    for (let i = 0; i < 2; i++) {
      // Examine the attack roll section
      assert
        .dom(`#nav-attacks [data-test-roll-detail="0-${i}"]`)
        .hasAttribute('title', '1d20: 20 | -1d6: 6')
        .hasText('17 to hit (CRIT!)');

      // Test the collapsible attack-roll details
      assert
        .dom(`#nav-attacks [data-test-roll-collapse-link="0-${i}"]`)
        .hasAria('expanded', 'false')
        .hasText('17');
      assert
        .dom(`#nav-attacks [data-test-roll-collapse-pane="0-${i}"]`)
        .hasText('1d20: 20 -1d6: 6')
        .doesNotHaveClass(
          'show',
          'attack roll detail pane should start collapsed',
        );

      // The attack roll details should be visible after a click
      await click(`#nav-attacks [data-test-roll-collapse-link="0-${i}"]`);
      // Delay briefly so that the pane finishes opening
      await delay();
      assert
        .dom(`#nav-attacks [data-test-roll-collapse-link="0-${i}"]`)
        .hasAria(
          'expanded',
          'true',
          'after click, attack roll detail pane should be expanded',
        );
      assert
        .dom(`#nav-attacks [data-test-roll-collapse-pane="0-${i}"]`)
        .hasClass(
          'show',
          'after click, attack roll detail pane should be visible',
        );

      // Do not test closing the pane; some sort of state appears to persist in
      // Bootstrap between tests, and makes closing the pane fail after the
      // first test that renders this form.

      // Examine the damage section
      assert
        .dom(`#nav-attacks [data-test-damage-roll-detail="0-${i}-0"]`)
        .hasAttribute('title', '2d12: 12, 12')
        .hasText('14 radiant damage (2d12 + 5) (resisted)');

      // Test the collapsible damage pane
      assert
        .dom(`#nav-attacks [data-test-damage-roll-collapse-link="0-${i}-0"]`)
        .hasAria('expanded', 'false')
        .hasText('14');
      assert
        .dom(`#nav-attacks [data-test-damage-roll-collapse-pane="0-${i}-0"]`)
        .hasText('2d12: 12, 12')
        .doesNotHaveClass(
          'show',
          'damage roll detail pane should start collapsed',
        );

      // The damage roll details should be visible after a click
      await click(
        `#nav-attacks [data-test-damage-roll-collapse-link="0-${i}-0"]`,
      );
      // Delay briefly so that the pane finishes opening
      await delay();
      assert
        .dom(`#nav-attacks [data-test-damage-roll-collapse-link="0-${i}-0"]`)
        .hasAria(
          'expanded',
          'true',
          'after click, damage roll detail pane should be expanded',
        );
      assert
        .dom(`#nav-attacks [data-test-damage-roll-collapse-pane="0-${i}-0"]`)
        .hasClass(
          'show',
          'after click, damage roll detail pane should be visible',
        );

      // Do not test closing the pane; some sort of state appears to persist in
      // Bootstrap between tests, and makes closing the pane fail after the
      // first test that renders this form.
    }
  });

  test('it displays a single attack set with minimized dice', async function (this: ElementContext, assert) {
    // Mock randomness so that all dice roll their minimum value
    const fakeRandom = fake.returns(0);
    const random = this.owner.lookup('service:randomness') as RandomnessService;
    random.random = fakeRandom;

    await visit('/');

    // Fill in some details for the attack
    await fillIn('#nav-attacks [data-test-input-numberOfAttacks]', '2');
    await fillIn('#nav-attacks [data-test-input-targetAC]', '15');
    await fillIn('#nav-attacks [data-test-input-toHit]', '3 - 1D6');
    await fillIn('#nav-attacks [data-test-input-damage="0"]', '1d12 + 5');
    await select(
      '#nav-attacks [data-test-damage-dropdown="0"]',
      DamageType.RADIANT.name,
    );

    // Calculate the attack
    await click('#nav-attacks [data-test-button-rollAttacks]');

    assert
      .dom('#nav-attacks [data-test-data-list="0"]')
      .hasText(
        'Number of attacks: 2\n' +
          'Target AC: 15\n' +
          'Attack roll: 1d20 - 1d6 + 3\n',
        'the details for the input damage should be displayed',
      );

    // Both attacks were a natural one
    assert
      .dom('#nav-attacks [data-test-total-damage-header="0"]')
      .hasText('Total Damage: 0 (0 hits)');

    // Check that the displayed text matches the expected die rolls. Since all
    // dice are minimized, the two attacks are identical.
    for (let i = 0; i < 2; i++) {
      // Examine the attack roll section
      assert
        .dom(`#nav-attacks [data-test-roll-detail="0-${i}"]`)
        .hasAttribute('title', '1d20: 1 | -1d6: 1')
        .hasText('3 to hit (NAT 1!)');

      // The damage section should be empty
      assert
        .dom(`#nav-attacks [data-test-damage-roll-detail="0-${i}-0"]`)
        .doesNotExist();
    }
  });

  test('it displays a set with a single attack with constant damage', async function (this: ElementContext, assert) {
    // Mock randomness so that this attack will hit, but not be a critical hit
    const fakeRandom = fake.returns(0.8);
    const random = this.owner.lookup('service:randomness') as RandomnessService;
    random.random = fakeRandom;

    await visit('/');

    // Configure an attack with one repetition and a low AC
    await fillIn('#nav-attacks [data-test-input-numberOfAttacks]', '1');
    await fillIn('#nav-attacks [data-test-input-targetAC]', '5');
    await fillIn('#nav-attacks [data-test-input-toHit]', '3');
    await fillIn('#nav-attacks [data-test-input-damage="0"]', '10');
    await select(
      '#nav-attacks [data-test-damage-dropdown="0"]',
      DamageType.FIRE.name,
    );
    await click('#nav-attacks [data-test-value="advantage"]');

    // Calculate the attack
    await click('#nav-attacks [data-test-button-rollAttacks]');

    assert
      .dom('#nav-attacks [data-test-data-list="0"]')
      .hasText(
        'Number of attacks: 1\nTarget AC: 5\nAttack roll: 1d20 + 3 (advantage)\n',
        'the details for the input damage should be displayed',
      );

    // The attack dealt constant damage; the single hit should be displayed
    // correctly
    assert
      .dom('#nav-attacks [data-test-total-damage-header="0"]')
      .hasText('Total Damage: 10 (1 hit)');

    // The attack roll should not be marked as a crit or as a natural one
    assert
      .dom(`#nav-attacks [data-test-roll-detail="0-0"]`)
      .hasAttribute('title', '1d20: 17, 17')
      .hasText('20 to hit');

    // Examine the damage section
    assert
      .dom(`#nav-attacks [data-test-damage-roll-detail="0-0-0"]`)
      .hasAttribute('title', '')
      .hasText('10 fire damage (10)');

    // The collapsible damage pane should not be present
    assert
      .dom('#nav-attacks [data-test-damage-roll-collapse-link="0-0-0"]')
      .doesNotExist(
        'damage should not be formatted as a link with a collapsble pane if there were no damage dice',
      );
  });

  test('it displays multiple sets of repeated attacks', async function (this: ElementContext, assert) {
    // Mock randomness so that the first attack is a hit and the second misses
    const fakeRandom = fake.returns(0.7);
    const random = this.owner.lookup('service:randomness') as RandomnessService;
    random.random = fakeRandom;

    await visit('/');

    // Fill in some details for the first attack
    await fillIn('#nav-attacks [data-test-input-numberOfAttacks]', '2');
    await fillIn('#nav-attacks [data-test-input-targetAC]', '15');
    await fillIn('#nav-attacks [data-test-input-toHit]', '2');
    await click('#nav-attacks [data-test-value="disadvantage"]');
    // Set up one damage type
    await fillIn('#nav-attacks [data-test-input-damage="0"]', '1d12 + 5');
    await select(
      '#nav-attacks [data-test-damage-dropdown="0"]',
      DamageType.BLUDGEONING.name,
    );
    await click('#nav-attacks [data-test-input-resistant="0"]');
    await click('#nav-attacks [data-test-input-vulnerable="0"]');
    // Add a second damage type
    await click('#nav-attacks [data-test-button-add-damage-type]');
    await fillIn('#nav-attacks [data-test-input-damage="1"]', '3d6');
    await select(
      '#nav-attacks [data-test-damage-dropdown="1"]',
      DamageType.COLD.name,
    );

    // Trigger the attack
    await click('#nav-attacks [data-test-button-rollAttacks]');

    // Change the attack details so that the next set of attacks will miss
    await fillIn('#nav-attacks [data-test-input-numberOfAttacks]', '1');
    await fillIn('#nav-attacks [data-test-input-targetAC]', '22');
    await click('#nav-attacks [data-test-value="straight"]');

    // Trigger the attack
    await click('#nav-attacks [data-test-button-rollAttacks]');

    // Inspect the second attack's details, which will be displayed first
    assert
      .dom('#nav-attacks [data-test-data-list="0"]')
      .hasText(
        'Number of attacks: 1\n' +
          'Target AC: 22\n' +
          'Attack roll: 1d20 + 2\n',
        'the details for the second set of attacks should be displayed',
      );

    // With an AC of 22, the attack should have missed
    assert
      .dom('#nav-attacks [data-test-total-damage-header="0"]')
      .hasText('Total Damage: 0 (0 hits)');

    // Examine the attack roll section
    assert
      .dom(`#nav-attacks [data-test-roll-detail="0-0"]`)
      .hasAttribute('title', '1d20: 15')
      .hasText('17 to hit');

    // Test the collapsible attack-roll details, making sure that these
    // function even with multiple attacks
    assert
      .dom(`#nav-attacks [data-test-roll-collapse-link="0-0"]`)
      .hasAria('expanded', 'false')
      .hasText('17');
    assert
      .dom(`#nav-attacks [data-test-roll-collapse-pane="0-0"]`)
      .hasText('1d20: 15')
      .doesNotHaveClass(
        'show',
        'attack roll detail pane should start collapsed',
      );

    // The attack roll details should be visible after a click
    await click(`#nav-attacks [data-test-roll-collapse-link="0-0"]`);
    // Delay briefly so that the pane finishes opening
    await delay();
    assert
      .dom(`#nav-attacks [data-test-roll-collapse-link="0-0"]`)
      .hasAria(
        'expanded',
        'true',
        'after click, attack roll detail pane should be expanded',
      );
    assert
      .dom(`#nav-attacks [data-test-roll-collapse-pane="0-0"]`)
      .hasClass(
        'show',
        'after click, attack roll detail pane should be visible',
      );

    // Do not test closing the pane; some sort of state appears to persist in
    // Bootstrap between tests, and makes closing the pane fail after the
    // first test that renders this form.

    // No damage was inflicted, since this did not hit
    assert
      .dom(`#nav-attacks [data-test-damage-roll-detail="0-0-0"]`)
      .doesNotExist();

    // Inspect the second set of attack's details
    assert
      .dom('#nav-attacks [data-test-data-list="1"]')
      .hasText(
        'Number of attacks: 2\n' +
          'Target AC: 15\n' +
          'Attack roll: 1d20 + 2 (disadvantage)\n',
        'the details for the first set of attacks should be displayed',
      );

    // Each d6 rolled a 5; the d12 rolled a 9, for [(9 + 5) / 2 * 2] + 3 * 5 =
    // 29 damage for each attack
    assert
      .dom('#nav-attacks [data-test-total-damage-header="1"]')
      .hasText('Total Damage: 58 (2 hits)');

    for (let i = 0; i < 2; i++) {
      // Examine the attack roll section
      assert
        .dom(`#nav-attacks [data-test-roll-detail="1-${i}"]`)
        .hasAttribute('title', '1d20: 15, 15')
        .hasText('17 to hit');

      // Test the collapsible attack-roll details
      assert
        .dom(`#nav-attacks [data-test-roll-collapse-link="1-${i}"]`)
        .hasAria('expanded', 'false')
        .hasText('17');
      assert
        .dom(`#nav-attacks [data-test-roll-collapse-pane="1-${i}"]`)
        .hasText('1d20: 15, 15')
        .doesNotHaveClass(
          'show',
          'attack roll detail pane should start collapsed',
        );

      // The attack roll details should be visible after a click
      await click(`#nav-attacks [data-test-roll-collapse-link="1-${i}"]`);
      // Delay briefly so that the pane finishes opening
      await delay();
      assert
        .dom(`#nav-attacks [data-test-roll-collapse-link="1-${i}"]`)
        .hasAria(
          'expanded',
          'true',
          'after click, attack roll detail pane should be expanded',
        );
      assert
        .dom(`#nav-attacks [data-test-roll-collapse-pane="1-${i}"]`)
        .hasClass(
          'show',
          'after click, attack roll detail pane should be visible',
        );

      // Do not test closing the pane; some sort of state appears to persist in
      // Bootstrap between tests, and makes closing the pane fail after the
      // first test that renders this form.

      // Examine the first damage section
      assert
        .dom(`#nav-attacks [data-test-damage-roll-detail="1-${i}-0"]`)
        .hasAttribute('title', '1d12: 9')
        .hasText('14 bludgeoning damage (1d12 + 5) (resisted) (vulnerable)');

      // Test the collapsible damage pane
      assert
        .dom(`#nav-attacks [data-test-damage-roll-collapse-link="1-${i}-0"]`)
        .hasAria('expanded', 'false')
        .hasText('14');
      assert
        .dom(`#nav-attacks [data-test-damage-roll-collapse-pane="1-${i}-0"]`)
        .hasText('1d12: 9')
        .doesNotHaveClass(
          'show',
          'damage roll detail pane should start collapsed',
        );

      // The damage roll details should be visible after a click
      await click(
        `#nav-attacks [data-test-damage-roll-collapse-link="1-${i}-0"]`,
      );
      // Delay briefly so that the pane finishes opening
      await delay();
      assert
        .dom(`#nav-attacks [data-test-damage-roll-collapse-link="1-${i}-0"]`)
        .hasAria(
          'expanded',
          'true',
          'after click, damage roll detail pane should be expanded',
        );
      assert
        .dom(`#nav-attacks [data-test-damage-roll-collapse-pane="1-${i}-0"]`)
        .hasClass(
          'show',
          'after click, damage roll detail pane should be visible',
        );

      // Do not test closing the pane; some sort of state appears to persist in
      // Bootstrap between tests, and makes closing the pane fail after the
      // first test that renders this form.

      // Examine the second damage section
      assert
        .dom(`#nav-attacks [data-test-damage-roll-detail="1-${i}-1"]`)
        .hasAttribute('title', '3d6: 5, 5, 5')
        .hasText('15 cold damage (3d6)');

      // Test the collapsible damage pane
      assert
        .dom(`#nav-attacks [data-test-damage-roll-collapse-link="1-${i}-1"]`)
        .hasAria('expanded', 'false')
        .hasText('15');
      assert
        .dom(`#nav-attacks [data-test-damage-roll-collapse-pane="1-${i}-1"]`)
        .hasText('3d6: 5, 5, 5')
        .doesNotHaveClass(
          'show',
          'damage roll detail pane should start collapsed',
        );

      // The damage roll details should be visible after a click
      await click(
        `#nav-attacks [data-test-damage-roll-collapse-link="1-${i}-1"]`,
      );
      // Delay briefly so that the pane finishes opening
      await delay();
      assert
        .dom(`#nav-attacks [data-test-damage-roll-collapse-link="1-${i}-1"]`)
        .hasAria(
          'expanded',
          'true',
          'after click, damage roll detail pane should be expanded',
        );
      assert
        .dom(`#nav-attacks [data-test-damage-roll-collapse-pane="1-${i}-1"]`)
        .hasClass(
          'show',
          'after click, damage roll detail pane should be visible',
        );

      // Do not test closing the pane; some sort of state appears to persist in
      // Bootstrap between tests, and makes closing the pane fail after the
      // first test that renders this form.
    }
  });

  test('it handles resistance and vulnerability', async function (this: ElementContext, assert) {
    // Mock randomness so that dice roll maximum values
    const fakeRandom = fake.returns(0.9999999999999);
    const random = this.owner.lookup('service:randomness') as RandomnessService;
    random.random = fakeRandom;

    await visit('/');

    // Fill in some details for the attacks
    await fillIn('#nav-attacks [data-test-input-numberOfAttacks]', '1');
    await fillIn('#nav-attacks [data-test-input-targetAC]', '14');
    await fillIn('#nav-attacks [data-test-input-toHit]', '0');
    await fillIn('#nav-attacks [data-test-input-damage="0"]', '1d8 + 1');
    await select(
      '#nav-attacks [data-test-damage-dropdown="0"]',
      DamageType.FIRE.name,
    );

    // Configure the damage to be resisted
    await click('#nav-attacks [data-test-input-resistant="0"]');

    // Roll the attacks
    await click('#nav-attacks [data-test-button-rollAttacks]');

    // Add vulnerability
    await click('#nav-attacks [data-test-input-vulnerable="0"]');

    // Roll a second set of attacks
    await click('#nav-attacks [data-test-button-rollAttacks]');

    // Remove damage resistance
    await click('#nav-attacks [data-test-input-resistant="0"]');

    // Roll a third set of attacks
    await click('#nav-attacks [data-test-button-rollAttacks]');

    // Most recent attack: vulnerability only
    assert
      .dom(`#nav-attacks [data-test-damage-roll-detail="0-0-0"]`)
      .hasAttribute('title', '2d8: 8, 8')
      .hasText(
        '34 fire damage (2d8 + 1) (vulnerable)',
        'first attack should be marked as vulnerable',
      );

    // Second attack: resistance and vulnerability
    assert
      .dom(`#nav-attacks [data-test-damage-roll-detail="1-0-0"]`)
      .hasAttribute('title', '2d8: 8, 8')
      .hasText(
        '16 fire damage (2d8 + 1) (resisted) (vulnerable)',
        'second attack should be marked as both resistant and vulnerable',
      );

    // Third attack: resistance only
    assert
      .dom(`#nav-attacks [data-test-damage-roll-detail="2-0-0"]`)
      .hasAttribute('title', '2d8: 8, 8')
      .hasText(
        '8 fire damage (2d8 + 1) (resisted)',
        'third attack should be marked as resisted',
      );
  });

  function delay() {
    return new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  }
});
