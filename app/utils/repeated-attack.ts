import AdvantageState from 'multiattack-5e/components/advantage-state-enum';

import Attack, { type AttackDetails } from './attack';
import type Damage from './damage';

export interface RepeatedAttackResult {
  // the parameters for this set of attacks
  numberOfAttacks: number;
  targetAC: number;
  toHit: string;
  damageList: Damage[];
  advantageState: AdvantageState;

  // the results of executing the repeated attacks
  totalDmg: number;
  totalNumberOfHits: number;
  attackDetailsList: AttackDetails[];
}

export default class RepeatedAttack {
  numberOfAttacks: number;
  targetAC: number;

  toHit: string;
  damageList: Damage[];
  advantageState: AdvantageState;

  constructor(
    numberOfAttacks: number,
    targetAC: number,
    toHit: string,
    damageList: Damage[],
    advantageState: AdvantageState,
  ) {
    this.numberOfAttacks = numberOfAttacks;
    this.targetAC = targetAC;
    this.toHit = toHit;
    this.damageList = damageList;
    this.advantageState = advantageState;
  }

  /**
   * Simulate attacks against a target with a given AC, with the details of the
   * attack specified by the constructor for this class. This method may
   * produce significantly different results on repeated calls, since it relies
   * heavily on the randomness of simulated dice.
   *
   * @returns a summary of the result of simulating repeated attacks with the
   * given parameters
   */
  simulateRepeatedAttacks(): RepeatedAttackResult {
    let totalDmg = 0;
    let totalNumberOfHits = 0;
    const attackDetailsList = [];

    const attack = new Attack(this.toHit, this.damageList.toArray());

    for (let i = 0; i < this.numberOfAttacks; i++) {
      const attackDetails = attack.makeAttack(
        this.targetAC,
        this.advantageState == AdvantageState.ADVANTAGE,
        this.advantageState == AdvantageState.DISADVANTAGE,
      );

      totalDmg += attackDetails.damage;
      totalNumberOfHits += attackDetails.numberOfHits;
      attackDetailsList.push(attackDetails);
    }

    return {
      numberOfAttacks: this.numberOfAttacks,
      targetAC: this.targetAC,
      toHit: this.toHit,
      damageList: this.damageList,
      advantageState: this.advantageState,

      totalDmg: totalDmg,
      totalNumberOfHits: totalNumberOfHits,
      attackDetailsList: attackDetailsList,
    };
  }
}
