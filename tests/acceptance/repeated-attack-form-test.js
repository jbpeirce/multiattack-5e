import { module, test } from 'qunit';
import { click, fillIn, visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

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
      .hasText('Current Attack', 'current attack heading should be displayed');
    assert
      .dom('h3')
      .hasText('Attack Details', 'attack details heading should be displayed');
  });

  test('displaying attack details', async function (assert) {
    await visit('/');

    // Fill in some details for the attack
    await fillIn('[data-test-input-numberOfAttacks]', 8);
    await fillIn('[data-test-input-targetAC]', 15);
    await fillIn('[data-test-input-toHit]', '3 - 1d6');
    await fillIn('[data-test-input-damage]', '2d6 + 3');

    // Get the attack-details string and verify that it matches expectations
    await click('[data-test-button-getDetails]');

    assert
      .dom('[data-test-message]')
      .hasValue(
        'Target AC: 15\n' +
          'Number of attacks: 8\n' +
          'Attack roll: 1d20 + 3 - 1d6\n' +
          'Attack damage: 2d6 + 3 of type piercing',
        'the details string for the input damage should be displayed'
      );
  });

  test('getting attack information', async function (assert) {
    await visit('/');

    // Fill in some details for the attack
    await fillIn('[data-test-input-numberOfAttacks]', 8);
    await fillIn('[data-test-input-targetAC]', 15);
    await fillIn('[data-test-input-toHit]', '3 - 1d6');
    await fillIn('[data-test-input-damage]', '2d6 + 5');
    await click('[data-test-advantage]');
    await click('[data-test-disadvantage]');
    await click('[data-test-resistant]');

    // Calculate the attack
    await click('[data-test-button-getDamage]');

    assert.true(
      this.element
        .querySelector('[data-test-message]')
        .value.includes(
          'Target AC: 15\n' +
            'Number of attacks: 8\n' +
            'Attack roll: 1d20 + 3 - 1d6\n' +
            '(rolls a straight roll, with advantage and disadvantage both set)\n' +
            'Attack damage: 2d6 + 5 of type piercing\n' +
            '(target resistant)'
        ),
      'attack details should be displayed'
    );

    let detailsRegex = /(?:\tAttack \d+ .* with an attack roll of \d+.)/g;
    assert.equal(
      this.element
        .querySelector('[data-test-message]')
        .value.match(detailsRegex).length,
      8,
      'eight sets of attack details should be displayed'
    );
  });
});
