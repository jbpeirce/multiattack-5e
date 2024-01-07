import { A } from '@ember/array';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import type { EmptyObject } from '@glimmer/component/-private/component';
import { tracked } from '@glimmer/tracking';

import type { AttackDetails } from 'multiattack-5e/utils/attack';
import Damage from 'multiattack-5e/utils/damage';
import DiceStringParser from 'multiattack-5e/utils/dice-string-parser';
import RepeatedAttack from 'multiattack-5e/utils/repeated-attack';
import type { RepeatedAttackResult } from 'multiattack-5e/utils/repeated-attack';

import AdvantageState from './advantage-state-enum';
import DamageType from './damage-type-enum';

export default class RepeatedAttackFormComponent extends Component {
  @tracked numberOfAttacks = 5;
  @tracked targetAC = 15;

  @tracked toHit = '5 + 1d4';

  @tracked damageList: Damage[] = A([this.getDefaultDamage()]);

  @tracked advantageState = AdvantageState.STRAIGHT;

  @tracked totalDmg = 0;
  @tracked totalNumberOfHits = 0;
  @tracked attackDetailsList: AttackDetails[] = [];

  @tracked attackResultLog: RepeatedAttackResult[];

  diceGroupsRegex = DiceStringParser.diceStringRegexAsString;

  /**
   * Set up an attack with default values and load the attack result log if
   * available
   */
  constructor(owner: unknown, args: EmptyObject) {
    super(owner, args);
    // TODO: Try to retrieve a stored attack log
    this.attackResultLog = [];
  }

  /**
   * This function is used to stop the repeated-attack-form handlebars from
   * refreshing the page whenever the form is submitted. Without this, the tests
   * which use form submission enter an infinite loop.
   * @returns false
   */
  @action
  suppressPageRefresh() {
    return false;
  }

  @action
  setAdvantageState(newState: AdvantageState) {
    assert(
      'advantage state handler must receive an advantage state',
      newState instanceof AdvantageState,
    );
    this.advantageState = newState;
  }

  @action
  addNewDamageType() {
    this.damageList.pushObject(this.getDefaultDamage());
  }

  @action
  removeDamageType(index: number) {
    this.damageList.removeAt(index);
  }

  getDefaultDamage(): Damage {
    return new Damage('2d6 + 3', DamageType.PIERCING.name);
  }

  simulateRepeatedAttacks = () => {
    const nextRepeatedAttack = new RepeatedAttack(
      this.numberOfAttacks,
      this.targetAC,
      this.toHit,
      this.damageList,
      this.advantageState,
    );

    // Create a new array so that the page will re-render
    this.attackResultLog = [
      nextRepeatedAttack.simulateRepeatedAttacks(),
      ...this.attackResultLog,
    ];

    // TODO: Attempt to store the updated attack log
  };
}
