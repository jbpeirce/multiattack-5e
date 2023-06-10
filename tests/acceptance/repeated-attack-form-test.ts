import { module, test } from 'qunit';
import { click, fillIn, visit, currentURL, select } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { ElementContext } from '../types/element-context';

module('Acceptance | repeated attack form', function (hooks) {
  setupApplicationTest(hooks);

  const detailsRegex = /(?:Attack \d+ .* with an attack roll of -?\d+.*$)/gm;

  test('verifying the regex for attack details', async function (assert) {
    const text =
      'Target AC: 15\n' +
      'Number of attacks: 5\n' +
      'Attack roll: 1d20 + 3 - 1d6\n' +
      '(rolls a straight roll, with advantage and disadvantage both set)\n' +
      'Attack damage: 2d6 + 5 piercing damage\n' +
      '(target resistant)\n' +
      '*** Total Damage: 4 ***\n' +
      '\tAttack 1 inflicted 4 damage with an attack roll of 25 (CRIT!)\n' +
      '\tAttack 2 missed with an attack roll of -4\n' +
      '\tAttack 3 missed with an attack roll of 13\n' +
      '\tAttack 4 missed with an attack roll of 0 (NAT 1!)\n' +
      '\tAttack 5 missed with an attack roll of 6\n';

    assert.deepEqual(
      text.match(detailsRegex),
      [
        'Attack 1 inflicted 4 damage with an attack roll of 25 (CRIT!)',
        'Attack 2 missed with an attack roll of -4',
        'Attack 3 missed with an attack roll of 13',
        'Attack 4 missed with an attack roll of 0 (NAT 1!)',
        'Attack 5 missed with an attack roll of 6',
      ],
      'the regular expression for the test should match expectations'
    );
  });

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
    await fillIn('[data-test-input-numberOfAttacks]', '8');
    await fillIn('[data-test-input-targetAC]', '15');
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
          'Attack damage: 2d6 + 3 piercing damage',
        'the details string for the input damage should be displayed'
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
    await click('[data-test-advantage]');
    await click('[data-test-disadvantage]');
    await click('[data-test-input-resistant]');

    // Calculate the attack
    await click('[data-test-button-getDamage]');

    const message = this.element.querySelector('[data-test-message]');
    assert.true(
      message != null,
      '[data-test-message] selector must be present'
    );

    const messageValue = (<HTMLInputElement>message).value;

    assert.true(
      messageValue.includes(
        'Target AC: 15\n' +
          'Number of attacks: 8\n' +
          'Attack roll: 1d20 + 3 - 1d6\n' +
          '(rolls with disadvantage)\n' +
          'Attack damage: 2d6 + 5 acid damage\n' +
          '(target resistant)'
      ),
      'attack details should be displayed'
    );

    assert.strictEqual(
      messageValue.match(detailsRegex)?.length,
      8,
      'eight sets of attack details should be displayed'
    );

    // assert.equal(
    //   this.element.querySelector('[data-test-message]').value,
    //   'test',
    //   'printing detailed message'
    // );
    // assert.equal(
    //   this.element
    //     .querySelector('[data-test-message]')
    //     .value.match(detailsRegex),
    //   [],
    //   'printing matches for the attack details'
    // );
  });
});
