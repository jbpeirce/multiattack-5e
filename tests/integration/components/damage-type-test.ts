import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { ElementContext } from 'multiattack-5e/tests/types/element-context';

module('Integration | Component | damage-type', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (this: ElementContext, assert) {
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
