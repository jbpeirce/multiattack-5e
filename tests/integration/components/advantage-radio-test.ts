import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AdvantageState from 'multiattack-5e/components/advantage-state-enum';

module('Integration | Component | advantage-radio', function (hooks) {
  setupRenderingTest(hooks);

  test('it initially renders as expected', async function (assert) {
    this.set('updateState', (actual: AdvantageState) => {
      assert.true(
        false,
        `updateState should not be called in initial render but was called with ${actual}`
      );
    });

    assert.expect(0);
    await render(hbs`<AdvantageRadio @updateState={{this.updateState}} />`);
  });

  test('it sets advantage as expected', async function (assert) {
    this.set('updateState', (actual: AdvantageState) => {
      assert.deepEqual(
        actual,
        AdvantageState.ADVANTAGE,
        'advantage should have been passed to the updateState function'
      );
    });

    await render(hbs`<AdvantageRadio @updateState={{this.updateState}} />`);

    assert.expect(1);
    await click('[data-test-value="advantage"]');
  });

  test('it sets disadvantage as expected', async function (assert) {
    this.set('updateState', (actual: AdvantageState) => {
      assert.deepEqual(
        actual,
        AdvantageState.DISADVANTAGE,
        'disadvantage should have been passed to the updateState function'
      );
    });

    await render(hbs`<AdvantageRadio @updateState={{this.updateState}} />`);

    assert.expect(1);
    await click('[data-test-value="disadvantage"]');
  });

  test('it sets a straight roll as expected', async function (assert) {
    this.set('updateState', (actual: AdvantageState) => {
      assert.deepEqual(
        actual,
        AdvantageState.STRAIGHT,
        'straight roll should have been set'
      );
    });

    await render(hbs`<AdvantageRadio @updateState={{this.updateState}} />`);

    assert.expect(1);
    await click('[data-test-value="straight"]');
  });
});
