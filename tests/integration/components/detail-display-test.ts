import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import AdvantageState from 'multiattack-5e/components/advantage-state-enum';
import DamageType from 'multiattack-5e/components/damage-type-enum';
import { type ElementContext } from 'multiattack-5e/tests/types/element-context';
import Damage from 'multiattack-5e/utils/damage';

module('Integration | Component | detail-display', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders multiple hits and misses in a single repeated attack', async function (this: ElementContext, assert) {
    this.set('repeatedAttackDetails', [
      {
        numberOfAttacks: 4,
        targetAC: 15,
        toHit: '3 - 1d6',
        damageList: [
          new Damage('2d6 + 5 + 1d4', DamageType.PIERCING.name, true, false),
          new Damage('2d8', DamageType.RADIANT.name, false, true),
        ],
        advantageState: AdvantageState.DISADVANTAGE,
        totalDmg: 62,
        totalNumberOfHits: 2,
        attackDetailsList: [
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
            hit: true,
            crit: true,
            nat1: false,
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
            hit: true,
            crit: false,
            nat1: false,
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
              total: 13,
              rolls: [
                {
                  name: '1d20',
                  rolls: [14],
                },
                {
                  name: '-1d6',
                  rolls: [4],
                },
              ],
            },
            hit: false,
            crit: false,
            nat1: false,
            damage: 0,
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
            hit: false,
            crit: false,
            nat1: true,
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

    await render(
      hbs`<DetailDisplay @repeatedAttackLog={{this.repeatedAttackDetails}} @clearAttackLog={{this.doNotCall}} />`,
    );

    assert
      .dom('[data-test-attack-data-list="0"]')
      .hasText(
        'Number of attacks: 4\n' +
          'Target AC: 15\n' +
          'Attack roll: 1d20 + 3 - 1d6 (disadvantage)\n',
        'the details for the input damage should be displayed',
      );

    assert
      .dom('[data-test-total-damage-header="0"]')
      .isVisible('damage header should be displayed')
      .hasText('Total Damage: 62 (2 hits)');

    assert
      .dom('[data-test-attack-detail-list="0"]')
      .isVisible('attack details should be displayed');

    const detailsList = this.element.querySelector(
      '[data-test-attack-detail-list="0"]',
    )?.children;
    assert.true(detailsList != null, 'detail list should be present');

    if (detailsList) {
      assert.equal(
        detailsList.length,
        4,
        '4 attacks should have been displayed',
      );

      // critical hit
      assert.equal(
        detailsList[0]?.className,
        'li-hit',
        'critical hit should have bullet point formatted as a hit',
      );
      assert
        .dom('[data-test-attack-roll-detail="0-0"]')
        .hasAttribute('title', '1d20: 20 | -1d6: 2')
        .hasText('21 to hit (CRIT!)');

      // regular hit
      assert.equal(
        detailsList[1]?.className,
        'li-hit',
        'normal hit should have bullet point formatted as a hit',
      );
      assert
        .dom('[data-test-attack-roll-detail="0-1"]')
        .hasAttribute('title', '1d20: 18 | -1d6: 3')
        .hasText('18 to hit');

      // miss with double-digit attack roll
      assert.equal(
        detailsList[2]?.className,
        'li-miss',
        'double-digit attack roll with a miss should have bullet point formatted as a miss',
      );
      assert
        .dom('[data-test-attack-roll-detail="0-2"]')
        .hasAttribute('title', '1d20: 14 | -1d6: 4')
        .hasText('13 to hit');

      //  miss with natural one
      assert.equal(
        detailsList[3]?.className,
        'li-miss',
        'natural one should have bullet point formatted as a miss',
      );
      assert
        .dom('[data-test-attack-roll-detail="0-3"]')
        .hasAttribute('title', '1d20: 1 | -1d6: 6')
        .hasText('-2 to hit (NAT 1!)');
    }

    // Inspect the detailed display of the critical hit's damage
    const critDamageDetailsList = this.element.querySelector(
      '[data-test-damage-detail-list="0-0"]',
    )?.children;
    assert.true(
      critDamageDetailsList != null,
      'damage detail list should be present',
    );
    assert.equal(
      critDamageDetailsList?.length,
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

    // Inspect the detailed display of the regular hit's damage
    const regularDamageDetailsList = this.element.querySelector(
      '[data-test-damage-detail-list="0-1"]',
    )?.children;
    assert.true(
      regularDamageDetailsList != null,
      'damage detail list should be present',
    );
    assert.equal(
      regularDamageDetailsList?.length,
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

  test('it renders a single hit correctly', async function (this: ElementContext, assert) {
    this.set('repeatedAttackDetails', [
      {
        numberOfAttacks: 2,
        targetAC: 15,
        toHit: '-3',
        damageList: [
          new Damage('2d6 + 5 + 1d4', DamageType.PIERCING.name, true, false),
          new Damage('2d8', DamageType.RADIANT.name, false, true),
        ],
        advantageState: AdvantageState.STRAIGHT,
        totalDmg: 25,
        totalNumberOfHits: 1,
        attackDetailsList: [
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
            hit: true,
            crit: false,
            nat1: false,
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
                      rolls: [2, 8],
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
              total: -1,
              rolls: [
                {
                  name: '1d20',
                  rolls: [2],
                },
              ],
            },
            hit: false,
            crit: false,
            nat1: false,
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

    await render(
      hbs`<DetailDisplay @repeatedAttackLog={{this.repeatedAttackDetails}} @clearAttackLog={{this.doNotCall}} />`,
    );

    assert
      .dom('[data-test-attack-data-list="0"]')
      .hasText(
        'Number of attacks: 2\nTarget AC: 15\nAttack roll: 1d20 -3\n',
        'the details for the attack should be displayed',
      );

    assert
      .dom('[data-test-total-damage-header="0"]')
      .isVisible('damage header should be displayed');

    assert
      .dom('[data-test-total-damage-header="0"]')
      .hasText('Total Damage: 25 (1 hit)');

    assert
      .dom('[data-test-attack-detail-list="0"]')
      .isVisible('attack details should be displayed');

    assert.equal(
      this.element.querySelector('[data-test-attack-detail-list="0"]')?.children
        .length,
      2,
      '2 attacks should have been displayed',
    );
  });

  test('it renders multiple repeated attacks correctly', async function (this: ElementContext, assert) {
    this.set('repeatedAttackDetails', [
      {
        numberOfAttacks: 2,
        targetAC: 15,
        toHit: '-3',
        damageList: [
          new Damage('2d6 + 5 + 1d4', DamageType.PIERCING.name, true, false),
          new Damage('2d8', DamageType.RADIANT.name, false, true),
        ],
        advantageState: AdvantageState.STRAIGHT,
        totalDmg: 15,
        totalNumberOfHits: 1,
        attackDetailsList: [
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
            hit: true,
            crit: false,
            nat1: false,
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
            hit: false,
            crit: false,
            nat1: false,
            damage: 0,
          },
        ],
      },
      {
        numberOfAttacks: 1,
        targetAC: 14,
        toHit: '3',
        damageList: [new Damage('3d6', DamageType.ACID.name, true, true)],
        advantageState: AdvantageState.ADVANTAGE,
        totalDmg: 10,
        totalNumberOfHits: 1,
        attackDetailsList: [
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
            hit: true,
            crit: false,
            nat1: false,
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

    await render(
      hbs`<DetailDisplay @repeatedAttackLog={{this.repeatedAttackDetails}} @clearAttackLog={{this.doNotCall}} />`,
    );

    // First attack
    assert
      .dom('[data-test-attack-data-list="0"]')
      .hasText(
        'Number of attacks: 2\nTarget AC: 15\nAttack roll: 1d20 -3\n',
        'first attack: the details for the attack should be displayed',
      );

    assert
      .dom('[data-test-total-damage-header="0"]')
      .hasText('Total Damage: 15 (1 hit)');

    const detailsList1 = this.element.querySelector(
      '[data-test-attack-detail-list="0"]',
    )?.children;
    assert.true(detailsList1 != null, 'detail list should be present');
    if (detailsList1) {
      assert.equal(
        detailsList1.length,
        2,
        'first attack: 2 attacks should have been displayed',
      );

      assert.equal(
        detailsList1[0]?.className,
        'li-hit',
        'first attack: hit should have bullet point formatted as a hit',
      );
      assert
        .dom('[data-test-attack-roll-detail="0-0"]')
        .hasAttribute('title', '1d20: 19')
        .hasText('16 to hit');

      assert.equal(
        detailsList1[1]?.className,
        'li-miss',
        'first attack: miss should have bullet point formatted as a miss',
      );
      assert
        .dom('[data-test-attack-roll-detail="0-1"]')
        .hasAttribute('title', '1d20: 2')
        .hasText('-1 to hit');
    }

    // Second attack
    assert
      .dom('[data-test-attack-data-list="1"]')
      .hasText(
        'Number of attacks: 1\nTarget AC: 14\nAttack roll: 1d20 + 3 (advantage)\n',
        'second attack: the details for the attack should be displayed',
      );

    assert
      .dom('[data-test-total-damage-header="1"]')
      .hasText('Total Damage: 10 (1 hit)');

    const detailsList2 = this.element.querySelector(
      '[data-test-attack-detail-list="1"]',
    )?.children;
    assert.true(detailsList2 != null, 'detail list should be present');
    if (detailsList2) {
      assert.equal(
        detailsList2.length,
        1,
        'second attack: 1 attack should have been displayed',
      );

      assert.equal(
        detailsList2[0]?.className,
        'li-hit',
        'second attack: hit should have bullet point formatted as a hit',
      );
      assert
        .dom('[data-test-attack-roll-detail="1-0"]')
        .hasAttribute('title', '1d20: 12')
        .hasText('15 to hit');
    }
  });
});
