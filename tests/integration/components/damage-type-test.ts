import { click, fillIn, render, select } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import DamageType from 'multiattack-5e/components/damage-type-enum';
import { type ElementContext } from 'multiattack-5e/tests/types/element-context';

module('Integration | Component | damage-type', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders expected initial values', async function (this: ElementContext, assert) {
    this.set('doNotCall', (actual: InputEvent) => {
      assert.true(
        false,
        `this setter should not have been called but was called with ${actual}`,
      );
    });

    this.set('damage', '1d6 + 3');
    this.set('damageType', DamageType.FIRE.name);
    this.set('resistant', true);
    this.set('vulnerable', false);

    await render(hbs`<DamageType @index={{0}} @setDamage={{this.doNotCall}} @setDamageType={{this.doNotCall}}
    @setResistant={{this.doNotCall}} @setVulnerable={{this.doNotCall}} @initialDamage={{this.damage}}
    @initialDamageType={{this.damageType}} @initialResistant={{this.resistant}}
    @initialVulnerable={{this.vulnerable}} />`);

    assert
      .dom('[data-test-input-damage="0"]')
      .hasValue('1d6 + 3', 'damage should be set to expected initial value');

    assert
      .dom('[data-test-damage-dropdown="0"]')
      .hasValue(
        DamageType.FIRE.name,
        'damage type should be set to expected initial value',
      );

    assert
      .dom('[data-test-input-resistant="0"]')
      .isChecked('resistance should be set to expected initial value');

    assert
      .dom('[data-test-input-vulnerable="0"]')
      .isNotChecked('vulnerability should be set to expected initial value');
  });

  test('it updates fields as expected', async function (this: ElementContext, assert) {
    this.set('setDamage', (actual: InputEvent) => {
      assert.true(
        actual.target instanceof HTMLInputElement,
        'damage handler must receive an event with a target that is an HTMLInputElement',
      );
      assert.equal(
        (<HTMLInputElement>actual.target).value,
        '3d8-1',
        'damage setter should be called with the expected value',
      );
    });

    this.set('setDamageType', (actual: InputEvent) => {
      assert.true(
        actual.target instanceof HTMLSelectElement,
        'damage type handler must receive an event with a target that is an HTMLSelectElement',
      );
      assert.equal(
        (<HTMLSelectElement>actual.target).value,
        DamageType.PSYCHIC.name,
        'damage type setter should be called with the expected value',
      );
    });

    this.set('setResistant', (actual: InputEvent) => {
      assert.true(
        actual.target instanceof HTMLInputElement,
        'damage type handler must receive an event with a target that is an HTMLInputElement',
      );
      assert.false(
        (<HTMLInputElement>actual.target).checked,
        'resistance setter should be called with the expected value',
      );
    });

    this.set('setVulnerable', (actual: InputEvent) => {
      assert.true(
        actual.target instanceof HTMLInputElement,
        'damage type handler must receive an event with a target that is an HTMLInputElement',
      );
      assert.true(
        (<HTMLInputElement>actual.target).checked,
        'vulnerability setter should be called with the expected value',
      );
    });

    this.set('damage', '1d6 + 3');
    this.set('damageType', DamageType.FIRE.name);
    this.set('resistant', true);
    this.set('vulnerable', false);

    await render(hbs`<DamageType @index={{3}} @setDamage={{this.setDamage}} @setDamageType={{this.setDamageType}}
    @setResistant={{this.setResistant}} @setVulnerable={{this.setVulnerable}} @initialDamage={{this.damage}}
    @initialDamageType={{this.damageType}} @initialResistant={{this.resistant}}
    @initialVulnerable={{this.vulnerable}} />`);

    await fillIn('[data-test-input-damage="3"]', '3d8-1');
    assert
      .dom('[data-test-input-damage="3"]')
      .hasValue('3d8-1', 'damage should be reset after form is filled in');

    await select('[data-test-damage-dropdown="3"]', DamageType.PSYCHIC.name);
    assert
      .dom('[data-test-damage-dropdown="3"]')
      .hasValue(
        DamageType.PSYCHIC.name,
        'damage type should be reset as expected',
      );

    await click('[data-test-input-resistant="3"]');
    assert
      .dom('[data-test-input-resistant="3"]')
      .isNotChecked('previously-checked resistance field should be unchecked');

    await click('[data-test-input-vulnerable="3"]');
    assert
      .dom('[data-test-input-vulnerable="3"]')
      .isChecked('previously-unchecked vulnerability field should be checked');
  });

  test('it invalidates malformatted fields', async function (this: ElementContext, assert) {
    this.set('setDamage', (actual: InputEvent) => {
      assert.true(
        actual.target instanceof HTMLInputElement,
        'damage handler must receive an event with a target that is an HTMLInputElement',
      );
      assert.equal(
        (<HTMLInputElement>actual.target).value,
        'invalid',
        'damage setter should be called with the expected value',
      );
    });

    this.set('doNotCall', (actual: InputEvent) => {
      assert.true(
        false,
        `this setter should not have been called but was called with ${actual}`,
      );
    });

    this.set('damage', '1d6 + 3');
    this.set('damageType', DamageType.FIRE.name);
    this.set('resistant', true);
    this.set('vulnerable', false);

    await render(hbs`<DamageType @index={{0}} @setDamage={{this.setDamage}} @setDamageType={{this.doNotCall}}
    @setResistant={{this.doNotCall}} @setVulnerable={{this.doNotCall}} @initialDamage={{this.damage}}
    @initialDamageType={{this.damageType}} @initialResistant={{this.resistant}}
    @initialVulnerable={{this.vulnerable}} />`);

    assert
      .dom('[data-test-input-damage="0"]')
      .isValid('initial damage should be valid');

    await fillIn('[data-test-input-damage="0"]', 'invalid');
    assert
      .dom('[data-test-input-damage="0"]')
      .isNotValid('invalid input should be flagged');
  });
});
