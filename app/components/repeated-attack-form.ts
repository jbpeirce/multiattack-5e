import { A } from '@ember/array';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import Attack, { AttackDetails } from 'multiattack-5e/utils/attack';
import Damage from 'multiattack-5e/utils/damage';
import DiceStringParser from 'multiattack-5e/utils/dice-string-parser';

import AdvantageState from './advantage-state-enum';
import DamageType from './damage-type-enum';

export default class RepeatedAttackFormComponent extends Component {
  @tracked numberOfAttacks = 5;
  @tracked targetAC = 15;

  @tracked toHit = '5 + 1d4';

  @tracked damageList: Damage[] = A([this.getDefaultDamage()]);

  @tracked advantageState = AdvantageState.STRAIGHT;

  @tracked attackTriggered = false;
  @tracked totalDmg = 0;
  @tracked attackDetailsList: AttackDetails[] = [];

  diceGroupsRegex = DiceStringParser.diceStringRegexAsString;

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
      newState instanceof AdvantageState
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
    this.attackTriggered = true;
    this.totalDmg = 0;
    this.attackDetailsList = [];

    const attack = new Attack(this.toHit, this.damageList.toArray());

    for (let i = 0; i < this.numberOfAttacks; i++) {
      const attackDetails = attack.makeAttack(
        this.targetAC,
        this.advantageState == AdvantageState.ADVANTAGE,
        this.advantageState == AdvantageState.DISADVANTAGE
      );

      this.totalDmg += attackDetails.damage;
      this.attackDetailsList.push(attackDetails);
    }
  };
}
