import { module, test } from 'qunit';
import { setupRenderingTest } from 'multiattack-5e/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | detail-display', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<DetailDisplay />`);

    assert.dom(this.element).hasText('');

    // Template block usage:
    await render(hbs`
      <DetailDisplay>
        template block text
      </DetailDisplay>
    `);

    assert.dom(this.element).hasText('template block text');
  });
});
