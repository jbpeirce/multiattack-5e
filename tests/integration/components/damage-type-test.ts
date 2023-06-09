import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render, select } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { ElementContext } from 'multiattack-5e/tests/types/element-context';

module('Integration | Component | damage-type', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders expected initial values', async function (this: ElementContext, assert) {
    this.set('setAny', (actual: InputEvent) => {
      assert.true(
        false,
        `the damage setters should not be called in the rendering test but were called with ${actual}`
      );
    });

    this.set('damage', '1d6 + 3');
    this.set('damageType', 'Fire');
    this.set('resistant', true);
    this.set('vulnerable', false);

    await render(hbs`<DamageType @setDamage={{this.setAny}} @setDamageType={{this.setAny}}
    @setResistant={{this.setAny}} @setVulnerable={{this.setAny}} @initialDamage={{this.damage}}
    @initialDamageType={{this.damageType}} @initialResistant={{this.resistant}}
    @initialVulnerable={{this.vulnerable}} />`);

    assert
      .dom('[data-test-input-damage]')
      .hasValue('1d6 + 3', 'damage should be set to expected initial value');

    assert
      .dom('[data-test-damage-dropdown]')
      .hasValue('Fire', 'damage type should be set to expected initial value');

    assert
      .dom('[data-test-input-resistant]')
      .isChecked('resistance should be set to expected initial value');

    assert
      .dom('[data-test-input-vulnerable]')
      .isNotChecked('vulnerability should be set to expected initial value');
  });

  test('it updates fields as expected', async function (this: ElementContext, assert) {
    this.set('setAny', (actual: InputEvent) => {
      assert.true(
        false,
        `the damage setters should not be called in the rendering test but were called with ${actual}`
      );
    });

    this.set('setDamage', (actual: InputEvent) => {
      assert.true(
        actual.target instanceof HTMLInputElement,
        'damage handler must receive an event with a target that is an HTMLInputElement'
      );
      assert.equal(
        (<HTMLInputElement>actual.target).value,
        '3d8-1',
        'damage setter should be called with the expected value'
      );
    });

    this.set('setDamageType', (actual: InputEvent) => {
      assert.true(
        actual.target instanceof HTMLSelectElement,
        'damage type handler must receive an event with a target that is an HTMLSelectElement'
      );
      assert.equal(
        (<HTMLSelectElement>actual.target).value,
        'Acid',
        'damage type setter should be called with the expected value'
      );
    });

    this.set('setResistant', (actual: InputEvent) => {
      assert.true(
        actual.target instanceof HTMLInputElement,
        'damage type handler must receive an event with a target that is an HTMLInputElement'
      );
      assert.false(
        (<HTMLInputElement>actual.target).checked,
        'resistance setter should be called with the expected value'
      );
    });

    this.set('setVulnerable', (actual: InputEvent) => {
      assert.true(
        actual.target instanceof HTMLInputElement,
        'damage type handler must receive an event with a target that is an HTMLInputElement'
      );
      assert.true(
        (<HTMLInputElement>actual.target).checked,
        'vulnerability setter should be called with the expected value'
      );
    });

    this.set('damage', '1d6 + 3');
    this.set('damageType', 'Fire');
    this.set('resistant', true);
    this.set('vulnerable', false);

    await render(hbs`<DamageType @setDamage={{this.setDamage}} @setDamageType={{this.setDamageType}}
    @setResistant={{this.setResistant}} @setVulnerable={{this.setVulnerable}} @initialDamage={{this.damage}}
    @initialDamageType={{this.damageType}} @initialResistant={{this.resistant}}
    @initialVulnerable={{this.vulnerable}} />`);

    await fillIn('[data-test-input-damage]', '3d8-1');
    assert
      .dom('[data-test-input-damage]')
      .hasValue('3d8-1', 'damage should be reset after form is filled in');

    await select('[data-test-damage-dropdown]', '[data-test-damage-Acid]');
    assert
      .dom('[data-test-damage-dropdown]')
      .hasValue('Acid', 'damage type should be reset as expected');

    await click('[data-test-input-resistant]');
    assert
      .dom('[data-test-input-resistant]')
      .isNotChecked('previously-checked resistance field should be unchecked');

    await click('[data-test-input-vulnerable]');
    assert
      .dom('[data-test-input-vulnerable]')
      .isChecked('previously-unchecked vulnerability field should be checked');
  });
});
