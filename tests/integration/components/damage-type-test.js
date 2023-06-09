import { module, test } from 'qunit';
import { setupRenderingTest } from 'multiattack-5e/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | damage-type', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<DamageType />`);

    assert.dom(this.element).hasText('');

    // Template block usage:
    await render(hbs`
      <DamageType>
        template block text
      </DamageType>
    `);

    assert.dom(this.element).hasText('template block text');
  });
});
