import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import AdvantageState from 'multiattack-5e/components/advantage-state-enum';
import DamageType from 'multiattack-5e/components/damage-type-enum';
import RandomnessService from 'multiattack-5e/services/randomness';
import {
  type RepeatedTestEventResult,
  type TestEventDetails,
} from 'multiattack-5e/tests/helpers/detail-display-helper';
import { type ElementContext } from 'multiattack-5e/tests/types/element-context';
import Damage from 'multiattack-5e/utils/damage';

module('Integration | Component | detail-display', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders both success and failure in a single repeated event', async function (this: ElementContext, assert) {
    this.set('repeatedEventDetails', [
      {
        numberOfRepetitions: 3,
        threshold: 15,
        d20Modifier: '3 - 1d6',
        damageList: [
          new Damage(
            '2d6 + 5 + 1d4',
            DamageType.PIERCING.name,
            new RandomnessService(),
            true,
            false,
          ),
          new Damage(
            '2d8',
            DamageType.RADIANT.name,
            new RandomnessService(),
            false,
            true,
          ),
        ],
        advantageState: AdvantageState.DISADVANTAGE,
        totalDmg: 62,
        totalSuccesses: 2,
        detailsList: [
          {
            roll: {
              total: 21,
              rolls: [
                {
                  name: '1d20',
                  rolls: [20],
                },
                {
                  name: '-1d6',
                  rolls: [2],
                },
              ],
            },
            success: true,
            majorSuccess: true,
            damage: 37,
            damageDetails: [
              {
                type: 'piercing',
                dice: '4d6 + 2d4 + 5',
                roll: {
                  total: 11,
                  rolls: [
                    {
                      name: '4d6',
                      rolls: [4, 5, 2, 2],
                    },
                    {
                      name: '2d4',
                      rolls: [3, 2],
                    },
                  ],
                },
                resisted: true,
                vulnerable: false,
              },
              {
                type: 'radiant',
                dice: '4d8',
                roll: {
                  total: 26,
                  rolls: [
                    {
                      name: '4d8',
                      rolls: [2, 7, 1, 3],
                    },
                  ],
                },
                resisted: false,
                vulnerable: true,
              },
            ],
          },
          {
            roll: {
              total: 18,
              rolls: [
                {
                  name: '1d20',
                  rolls: [18],
                },
                {
                  name: '-1d6',
                  rolls: [3],
                },
              ],
            },
            success: true,
            majorSuccess: false,
            damage: 25,
            damageDetails: [
              {
                type: 'piercing',
                dice: '2d6 + 1d4 + 5',
                roll: {
                  total: 5,
                  rolls: [
                    {
                      name: '2d6',
                      rolls: [2, 1],
                    },
                    {
                      name: '1d4',
                      rolls: [2],
                    },
                  ],
                },
                resisted: true,
                vulnerable: false,
              },
              {
                type: 'radiant',
                dice: '2d8',
                roll: {
                  total: 20,
                  rolls: [
                    {
                      name: '2d8',
                      rolls: [3, 7],
                    },
                  ],
                },
                resisted: false,
                vulnerable: true,
              },
            ],
          },
          {
            roll: {
              total: -2,
              rolls: [
                {
                  name: '1d20',
                  rolls: [1],
                },
                {
                  name: '-1d6',
                  rolls: [6],
                },
              ],
            },
            success: false,
            majorSuccess: false,
            damage: 0,
          },
        ],
      },
    ]);

    this.set('doNotCall', (actual: InputEvent) => {
      assert.true(
        false,
        `this setter should not have been called but was called with ${actual}`,
      );
    });

    setupDetailDisplayTest(this);

    await render(
      hbs`<DetailDisplay @log={{this.repeatedEventDetails}} @clearLog={{this.doNotCall}} @getLogHeader={{this.getLogHeader}}
      @getSuccessCountString={{this.getSuccessCountString}} @getRepCountString={{this.getRepCountString}}
      @getThresholdString={{this.getThresholdString}} @getD20Modifier={{this.getD20Modifier}}
      @getRollString={{this.getRollString}} @isSuccess={{this.isSuccess}}
      @getD20RollString={{this.getD20RollString}}
      @shouldBoldDice={{this.shouldBoldDice}} />`,
    );

    assert
      .dom('[data-test-data-list="0"]')
      .hasText(
        'Repetitions: 3\n' +
          'Success threshold: 15\n' +
          'Roll: 1d20 + 3 - 1d6 (disadvantage)\n',
        'the details for the repeated sequence should be displayed',
      );

    assert
      .dom('[data-test-total-damage-header="0"]')
      .isVisible('damage and success header should be displayed')
      .hasText('Total Damage: 62 (2 successes)');

    assert
      .dom('[data-test-detail-list="0"]')
      .isVisible('details should be displayed');

    const detailsList = this.element.querySelector(
      '[data-test-detail-list="0"]',
    )?.children;
    assert.true(detailsList != null, 'detail list should be present');

    if (detailsList) {
      assert.equal(
        detailsList.length,
        3,
        '3 repetitions should have been displayed',
      );

      // success 1
      assert.equal(
        detailsList[0]?.className,
        'li-success',
        'first success should have bullet point formatted as a success',
      );
      assert
        .dom('[data-test-roll-detail="0-0"]')
        .hasAttribute('title', '1d20: 20 | -1d6: 2')
        .hasText('21 from roll');

      // success 2
      assert.equal(
        detailsList[1]?.className,
        'li-success',
        'second success should have bullet point formatted as a success',
      );
      assert
        .dom('[data-test-roll-detail="0-1"]')
        .hasAttribute('title', '1d20: 18 | -1d6: 3')
        .hasText('18 from roll');

      // failure
      assert.equal(
        detailsList[2]?.className,
        'li-fail',
        'failure should have bullet point formatted as a failure',
      );
      assert
        .dom('[data-test-roll-detail="0-2"]')
        .hasAttribute('title', '1d20: 1 | -1d6: 6')
        .hasText('-2 from roll');
    }

    // Inspect the detailed display of the first success's damage
    const firstDamageDetailsList = this.element.querySelector(
      '[data-test-damage-detail-list="0-0"]',
    )?.children;
    assert.true(
      firstDamageDetailsList != null,
      'damage detail list should be present',
    );
    assert.equal(
      firstDamageDetailsList?.length,
      2,
      '2 types of damage should have been displayed',
    );

    assert
      .dom('[data-test-damage-roll-detail="0-0-0"]')
      .hasAttribute('title', '4d6: 4, 5, 2, 2 | 2d4: 3, 2')
      .hasText('11 piercing damage (4d6 + 2d4 + 5) (resisted)');
    assert
      .dom('[data-test-damage-roll-collapse-link="0-0-0"]')
      .hasAria('expanded', 'false')
      .hasText('11');
    assert
      .dom('[data-test-damage-roll-collapse-pane="0-0-0"]')
      .hasText('4d6: 4, 5, 2, 2 2d4: 3, 2');

    assert
      .dom('[data-test-damage-roll-detail="0-0-1"]')
      .hasAttribute('title', '4d8: 2, 7, 1, 3')
      .hasText('26 radiant damage (4d8) (vulnerable)');
    assert
      .dom('[data-test-damage-roll-collapse-link="0-0-1"]')
      .hasAria('expanded', 'false')
      .hasText('26');
    assert
      .dom('[data-test-damage-roll-collapse-pane="0-0-1"]')
      .hasText('4d8: 2, 7, 1, 3');

    // Inspect the detailed display of the second hit's damage
    const secondDamageDetailsList = this.element.querySelector(
      '[data-test-damage-detail-list="0-1"]',
    )?.children;
    assert.true(
      secondDamageDetailsList != null,
      'damage detail list should be present',
    );
    assert.equal(
      secondDamageDetailsList?.length,
      2,
      '2 types of damage should have been displayed',
    );

    assert
      .dom('[data-test-damage-roll-detail="0-1-0"]')
      .hasAttribute('title', '2d6: 2, 1 | 1d4: 2')
      .hasText('5 piercing damage (2d6 + 1d4 + 5) (resisted)');
    assert
      .dom('[data-test-damage-roll-collapse-link="0-1-0"]')
      .hasAria('expanded', 'false')
      .hasText('5');
    assert
      .dom('[data-test-damage-roll-collapse-pane="0-1-0"]')
      .hasText('2d6: 2, 1 1d4: 2');

    assert
      .dom('[data-test-damage-roll-detail="0-1-1"]')
      .hasAttribute('title', '2d8: 3, 7')
      .hasText('20 radiant damage (2d8) (vulnerable)');
    assert
      .dom('[data-test-damage-roll-collapse-link="0-1-1"]')
      .hasAria('expanded', 'false')
      .hasText('20');
    assert
      .dom('[data-test-damage-roll-collapse-pane="0-1-1"]')
      .hasText('2d8: 3, 7');
  });

  test('it renders multiple repeated events correctly', async function (this: ElementContext, assert) {
    this.set('repeatedEventDetails', [
      {
        numberOfRepetitions: 2,
        threshold: 15,
        d20Modifier: '-3',
        damageList: [
          new Damage(
            '2d6 + 5 + 1d4',
            DamageType.PIERCING.name,
            new RandomnessService(),
            true,
            false,
          ),
          new Damage(
            '2d8',
            DamageType.RADIANT.name,
            new RandomnessService(),
            false,
            true,
          ),
        ],
        advantageState: AdvantageState.STRAIGHT,
        totalDmg: 15,
        totalSuccesses: 1,
        detailsList: [
          {
            roll: {
              total: 16,
              rolls: [
                {
                  name: '1d20',
                  rolls: [19],
                },
              ],
            },
            success: true,
            majorSuccess: false,
            damage: 15,
            damageDetails: [
              {
                type: 'piercing',
                dice: '2d6 + 1d4 + 5',
                roll: {
                  total: 5,
                  rolls: [
                    {
                      name: '2d6',
                      rolls: [2, 1],
                    },
                    {
                      name: '1d4',
                      rolls: [2],
                    },
                  ],
                },
                resisted: true,
                vulnerable: false,
              },
              {
                type: 'radiant',
                dice: '2d8',
                roll: {
                  total: 10,
                  rolls: [
                    {
                      name: '2d8',
                      rolls: [2, 8],
                    },
                  ],
                },
                resisted: false,
                vulnerable: false,
              },
            ],
          },
          {
            roll: {
              total: -1,
              rolls: [
                {
                  name: '1d20',
                  rolls: [2],
                },
              ],
            },
            success: false,
            majorSuccess: false,
            damage: 0,
          },
        ],
      },
      {
        numberOfRepetitions: 1,
        threshold: 14,
        d20Modifier: '3',
        damageList: [
          new Damage(
            '3d6',
            DamageType.ACID.name,
            new RandomnessService(),
            true,
            true,
          ),
        ],
        advantageState: AdvantageState.ADVANTAGE,
        totalDmg: 10,
        totalSuccesses: 1,
        detailsList: [
          {
            roll: {
              total: 15,
              rolls: [
                {
                  name: '1d20',
                  rolls: [12],
                },
              ],
            },
            success: true,
            majorSuccess: false,
            damage: 10,
            damageDetails: [
              {
                type: 'acid',
                dice: '3d6',
                roll: {
                  total: 10,
                  rolls: [
                    {
                      name: '3d6',
                      rolls: [2, 5, 4],
                    },
                  ],
                },
                resisted: true,
                vulnerable: true,
              },
            ],
          },
        ],
      },
    ]);

    this.set('doNotCall', (actual: InputEvent) => {
      assert.true(
        false,
        `this setter should not have been called but was called with ${actual}`,
      );
    });

    setupDetailDisplayTest(this);

    await render(
      hbs`<DetailDisplay @log={{this.repeatedEventDetails}} @clearLog={{this.doNotCall}} @getLogHeader={{this.getLogHeader}}
      @getSuccessCountString={{this.getSuccessCountString}} @getRepCountString={{this.getRepCountString}}
      @getThresholdString={{this.getThresholdString}} @getD20Modifier={{this.getD20Modifier}}
      @getRollString={{this.getRollString}} @isSuccess={{this.isSuccess}}
      @getD20RollString={{this.getD20RollString}}
      @shouldBoldDice={{this.shouldBoldDice}} />`,
    );

    // First set of repeated events
    assert
      .dom('[data-test-data-list="0"]')
      .hasText(
        'Repetitions: 2\nSuccess threshold: 15\nRoll: 1d20 -3\n',
        'first event set: the details for the set of repeated events should be displayed',
      );

    assert
      .dom('[data-test-total-damage-header="0"]')
      .hasText('Total Damage: 15 (1 success)');

    const detailsList1 = this.element.querySelector(
      '[data-test-detail-list="0"]',
    )?.children;
    assert.true(detailsList1 != null, 'detail list should be present');
    if (detailsList1) {
      assert.equal(
        detailsList1.length,
        2,
        'first event set: 2 events should have been displayed',
      );

      assert.equal(
        detailsList1[0]?.className,
        'li-success',
        'first event set: success should have bullet point formatted as a success',
      );
      assert
        .dom('[data-test-roll-detail="0-0"]')
        .hasAttribute('title', '1d20: 19')
        .hasText('16 from roll');

      assert.equal(
        detailsList1[1]?.className,
        'li-fail',
        'first event set: failure should have bullet point formatted as a failure',
      );
      assert
        .dom('[data-test-roll-detail="0-1"]')
        .hasAttribute('title', '1d20: 2')
        .hasText('-1 from roll');
    }

    // Second event set
    assert
      .dom('[data-test-data-list="1"]')
      .hasText(
        'Repetitions: 1\nSuccess threshold: 14\nRoll: 1d20 + 3 (advantage)\n',
        'second event set: the details for the event set should be displayed',
      );

    assert
      .dom('[data-test-total-damage-header="1"]')
      .hasText('Total Damage: 10 (1 success)');

    const detailsList2 = this.element.querySelector(
      '[data-test-detail-list="1"]',
    )?.children;
    assert.true(detailsList2 != null, 'detail list should be present');
    if (detailsList2) {
      assert.equal(
        detailsList2.length,
        1,
        'second event set: 1 event should have been displayed',
      );

      assert.equal(
        detailsList2[0]?.className,
        'li-success',
        'second event set: success should have bullet point formatted as a success',
      );
      assert
        .dom('[data-test-roll-detail="1-0"]')
        .hasAttribute('title', '1d20: 12')
        .hasText('15 from roll');
    }
  });

  test('it renders damage rolls without dice correctly', async function (this: ElementContext, assert) {
    this.set('repeatedEventDetails', [
      {
        numberOfRepetitions: 1,
        threshold: 15,
        d20Modifier: '3',
        damageList: [
          new Damage(
            '60',
            DamageType.FORCE.name,
            new RandomnessService(),
            true,
            false,
          ),
        ],
        advantageState: AdvantageState.STRAIGHT,
        totalDmg: 60,
        totalSuccesses: 1,
        detailsList: [
          {
            roll: {
              total: 21,
              rolls: [
                {
                  name: '1d20',
                  rolls: [18],
                },
              ],
            },
            success: true,
            majorSuccess: false,
            damage: 60,
            damageDetails: [
              {
                type: 'force',
                dice: '60',
                roll: {
                  total: 60,
                  rolls: [],
                },
                resisted: false,
                vulnerable: false,
              },
            ],
          },
        ],
      },
    ]);

    this.set('doNotCall', (actual: InputEvent) => {
      assert.true(
        false,
        `this setter should not have been called but was called with ${actual}`,
      );
    });

    setupDetailDisplayTest(this);

    await render(
      hbs`<DetailDisplay @log={{this.repeatedEventDetails}} @clearLog={{this.doNotCall}} @getLogHeader={{this.getLogHeader}}
      @getSuccessCountString={{this.getSuccessCountString}} @getRepCountString={{this.getRepCountString}}
      @getThresholdString={{this.getThresholdString}} @getD20Modifier={{this.getD20Modifier}}
      @getRollString={{this.getRollString}} @isSuccess={{this.isSuccess}}
      @getD20RollString={{this.getD20RollString}}
      @shouldBoldDice={{this.shouldBoldDice}} />`,
    );

    // The damage should not have been formatted as a link since there were no
    // associated dice
    assert
      .dom('[data-test-damage-roll-detail="0-0-0"]')
      .hasAttribute('title', '')
      .hasText('60 force damage (60)');
    assert
      .dom('[data-test-damage-roll-collapse-link="0-0-0"]')
      .doesNotExist(
        'damage should not be formatted as a link with a collapsble pane if there were no damage dice',
      );
  });

  test('it renders an event set without damage correctly', async function (this: ElementContext, assert) {
    this.set('repeatedEventDetails', [
      {
        numberOfRepetitions: 1,
        threshold: 15,
        d20Modifier: '3',
        damageList: [],
        advantageState: AdvantageState.ADVANTAGE,
        totalDmg: 0,
        totalSuccesses: 1,
        detailsList: [
          {
            roll: {
              total: 21,
              rolls: [
                {
                  name: '1d20',
                  rolls: [18],
                },
              ],
            },
            success: true,
            majorSuccess: false,
            damage: 0,
            damageDetails: [],
          },
        ],
      },
    ]);

    this.set('doNotCall', (actual: InputEvent) => {
      assert.true(
        false,
        `this setter should not have been called but was called with ${actual}`,
      );
    });

    setupDetailDisplayTest(this);

    await render(
      hbs`<DetailDisplay @log={{this.repeatedEventDetails}} @clearLog={{this.doNotCall}} @getLogHeader={{this.getLogHeader}}
      @getSuccessCountString={{this.getSuccessCountString}} @getRepCountString={{this.getRepCountString}}
      @getThresholdString={{this.getThresholdString}} @getD20Modifier={{this.getD20Modifier}}
      @getRollString={{this.getRollString}} @isSuccess={{this.isSuccess}}
      @getD20RollString={{this.getD20RollString}}
      @shouldBoldDice={{this.shouldBoldDice}} />`,
    );

    assert
      .dom('[data-test-data-list="0"]')
      .hasText(
        'Repetitions: 1\n' +
          'Success threshold: 15\n' +
          'Roll: 1d20 + 3 (advantage)\n',
        'the details for the repeated sequence should be displayed',
      );

    assert
      .dom('[data-test-total-damage-header="0"]')
      .isVisible('damage and success header should be displayed')
      .hasText('Total Damage: 0 (1 success)');

    assert
      .dom('[data-test-detail-list="0"]')
      .isVisible('details should be displayed');

    const detailsList = this.element.querySelector(
      '[data-test-detail-list="0"]',
    )?.children;
    assert.true(detailsList != null, 'detail list should be present');

    if (detailsList) {
      assert.equal(
        detailsList.length,
        1,
        '1 repetition should have been displayed',
      );

      // the roll for the success should have been displayed
      assert.equal(
        detailsList[0]?.className,
        'li-success',
        'first success should have bullet point formatted as a success',
      );
      assert
        .dom('[data-test-roll-detail="0-0"]')
        .hasAttribute('title', '1d20: 18')
        .hasText('21 from roll');
    }

    // no damage is associated with this event
    assert.dom('[data-test-damage-detail-list="0-0"]').exists();
    assert.equal(
      this.element.querySelector('[data-test-damage-detail-list="0-0"]')
        ?.children.length,
      0,
      'no damage is present for this event',
    );
  });

  test('it renders an event set with 0 repetitions (and no details) correctly', async function (this: ElementContext, assert) {
    this.set('repeatedEventDetails', [
      {
        numberOfRepetitions: 0,
        threshold: 10,
        d20Modifier: '1d4',
        damageList: [],
        advantageState: AdvantageState.STRAIGHT,
        totalDmg: 0,
        totalSuccesses: 0,
        detailsList: [],
      },
    ]);

    this.set('doNotCall', (actual: InputEvent) => {
      assert.true(
        false,
        `this setter should not have been called but was called with ${actual}`,
      );
    });

    setupDetailDisplayTest(this);

    await render(
      hbs`<DetailDisplay @log={{this.repeatedEventDetails}} @clearLog={{this.doNotCall}} @getLogHeader={{this.getLogHeader}}
      @getSuccessCountString={{this.getSuccessCountString}} @getRepCountString={{this.getRepCountString}}
      @getThresholdString={{this.getThresholdString}} @getD20Modifier={{this.getD20Modifier}}
      @getRollString={{this.getRollString}} @isSuccess={{this.isSuccess}}
      @getD20RollString={{this.getD20RollString}}
      @shouldBoldDice={{this.shouldBoldDice}} />`,
    );

    assert
      .dom('[data-test-data-list="0"]')
      .hasText(
        'Repetitions: 0\nSuccess threshold: 10\nRoll: 1d20 + 1d4\n',
        'the details for the repeated sequence should be displayed',
      );

    assert
      .dom('[data-test-total-damage-header="0"]')
      .isVisible('damage and success header should be displayed')
      .hasText('Total Damage: 0 (0 successes)');

    assert
      .dom('[data-test-detail-list="0"]')
      .exists('details should be displayed');

    assert.equal(
      this.element.querySelector('[data-test-detail-list="0"]')?.children
        .length,
      0,
      'no details are present for this event set',
    );
  });

  /**
   * Set up a uniform set of helper functions for the detail display being
   * tested.
   * @param context the context of a specific test
   */
  function setupDetailDisplayTest(context: ElementContext) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context.set('getLogHeader', (ignored: InputEvent) => {
      return 'Header for Log';
    });

    context.set(
      'getSuccessCountString',
      (eventSetData: RepeatedTestEventResult) => {
        if (eventSetData.totalSuccesses == 1) {
          return `${eventSetData.totalSuccesses} success`;
        }
        return `${eventSetData.totalSuccesses} successes`;
      },
    );

    context.set(
      'getRepCountString',
      (eventSetData: RepeatedTestEventResult) => {
        return `Repetitions: ${eventSetData.numberOfRepetitions}`;
      },
    );

    context.set(
      'getThresholdString',
      (eventSetData: RepeatedTestEventResult) => {
        return `Success threshold: ${eventSetData.threshold}`;
      },
    );

    context.set('getD20Modifier', (eventSetData: RepeatedTestEventResult) => {
      return `${eventSetData.d20Modifier}`;
    });

    context.set('getRollString', (d20String: string) => {
      return `Roll: ${d20String}`;
    });

    context.set('isSuccess', (eventData: TestEventDetails) => {
      return eventData.success;
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context.set('getD20RollString', (ignored: TestEventDetails) => {
      return `from roll`;
    });

    context.set('shouldBoldDice', (eventData: TestEventDetails) => {
      return eventData.majorSuccess;
    });
  }
});
