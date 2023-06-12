import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Attack, { AttackDetails } from 'multiattack-5e/utils/attack';
import Damage from 'multiattack-5e/utils/damage';
import AdvantageState from './advantage-state';
import { assert } from '@ember/debug';
import DiceStringParser from 'multiattack-5e/utils/dice-string-parser';

export default class RepeatedAttackFormComponent extends Component {
  @tracked numberOfAttacks = 0;
  @tracked targetAC = 0;

  @tracked toHit = '5 + 1d4';
  @tracked damage = '2d6 + 3';
  @tracked damageType = 'Piercing';

  @tracked resistant = false;
  @tracked vulnerable = false;

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
  setDamageType(newType: InputEvent) {
    assert(
      'damage type handler must receive an event with a target that is an HTMLSelectElement',
      newType.target instanceof HTMLSelectElement
    );
    this.damageType = newType.target.value || 'Piercing';
  }

  @action
  setDamage(newDamage: InputEvent) {
    assert(
      'damage handler must receive an event with a target that is an HTMLInputElement',
      newDamage.target instanceof HTMLInputElement
    );

    this.damage = newDamage.target.value || '0';
  }

  @action
  setResistant(newResistant: InputEvent) {
    assert(
      'resistance handler must receive an event with a target that is an HTMLInputElement',
      newResistant.target instanceof HTMLInputElement
    );
    this.resistant = newResistant.target.checked || false;
  }

  @action
  setVulnerable(newVulnerable: InputEvent) {
    assert(
      'vulnerability handler must receive an event with a target that is an HTMLInputElement',
      newVulnerable.target instanceof HTMLInputElement
    );
    this.vulnerable = newVulnerable.target.checked || false;
  }

  simulateRepeatedAttacks = () => {
    this.attackTriggered = true;
    this.totalDmg = 0;
    this.attackDetailsList = [];

    const attack = new Attack(this.toHit, [
      new Damage(this.damage, this.damageType, this.resistant, this.vulnerable),
    ]);

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
