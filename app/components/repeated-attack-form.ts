import { A } from '@ember/array';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import type { EmptyObject } from '@glimmer/component/-private/component';
import { tracked } from '@glimmer/tracking';

import type RandomnessService from 'multiattack-5e/services/randomness';
import type { AttackDetails } from 'multiattack-5e/utils/attack';
import Damage from 'multiattack-5e/utils/damage';
import DiceStringParser from 'multiattack-5e/utils/dice-string-parser';
import RepeatedAttack from 'multiattack-5e/utils/repeated-attack';
import type { RepeatedAttackResult } from 'multiattack-5e/utils/repeated-attack';

import AdvantageState from './advantage-state-enum';
import DamageType from './damage-type-enum';

export default class RepeatedAttackFormComponent extends Component {
  @service('randomness') randomness: RandomnessService | undefined;

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

  @action
  clearAttackLog() {
    // TODO: Clear the log from storage as well as in memory
    this.attackResultLog = [];
  }

  getDefaultDamage(): Damage {
    if (!this.randomness) {
      throw new Error(
        'Unable to access randomness service; service injection failed?',
      );
    }
    return new Damage('2d6 + 3', DamageType.PIERCING.name, this.randomness);
  }

  /**
   * Customize the attack detail log
   * @returns the desired header for the attack detail log
   */
  getLogHeader = () => {
    return 'Attack Log';
  };

  /**
   * Use the attack's number of hits to return either "N hits" or "1 hit" as
   * appropriate
   * @param repeatedAttack the result of a repeated set of attacks, which
   * specifies the total number of hits in the set of attacks
   * @returns "1 hit" or "numberOfHits hits" depending on whether the number of
   * hits in the input data is one.
   */
  getHitCountString = (repeatedAttack: RepeatedAttackResult) => {
    if (repeatedAttack.totalNumberOfHits == 1) {
      return `${repeatedAttack.totalNumberOfHits} hit`;
    } else {
      return `${repeatedAttack.totalNumberOfHits} hits`;
    }
  };

  getAttackCountString = (repeatedAttack: RepeatedAttackResult) => {
    return `Number of attacks: ${repeatedAttack.numberOfAttacks}`;
  };

  getTargetACString = (repeatedAttack: RepeatedAttackResult) => {
    return `Target AC: ${repeatedAttack.targetAC}`;
  };

  getToHitModifier = (repeatedAttack: RepeatedAttackResult) => {
    return repeatedAttack.toHit;
  };

  getAttackRollString = (toHitString: string) => {
    return `Attack roll: ${toHitString}`;
  };

  getD20RollString = (attack: AttackDetails) => {
    if (attack.crit) {
      return `to hit (CRIT!)`;
    }
    if (attack.nat1) {
      return `to hit (NAT 1!)`;
    }
    return `to hit`;
  };

  shouldBoldDice = (attack: AttackDetails) => {
    return attack.crit;
  };

  isHit = (attack: AttackDetails) => {
    return attack.hit;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getDamageModifications = (ignored: AttackDetails) => {
    return '';
  };

  simulateRepeatedAttacks = () => {
    if (!this.randomness) {
      throw new Error(
        'Unable to access randomness service; service injection failed?',
      );
    }

    const nextRepeatedAttack = new RepeatedAttack(
      this.numberOfAttacks,
      this.targetAC,
      this.toHit,
      this.damageList,
      this.advantageState,
      this.randomness,
    );

    // Create a new array so that the page will re-render
    this.attackResultLog = [
      nextRepeatedAttack.simulateRepeatedAttacks(),
      ...this.attackResultLog,
    ];

    // TODO: Attempt to store the updated attack log
  };
}
