import { type TestContext } from '@ember/test-helpers';

/**
 * An interface for working with tests that include a .element field in the context.
 */
export interface ElementContext extends TestContext {
  element: HTMLElement;
}
