import AdvantageState from 'multiattack-5e/components/advantage-state-enum';
import type RandomnessService from 'multiattack-5e/services/randomness';

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
  detailsList: AttackDetails[];
}

export default class RepeatedAttack {
  numberOfAttacks: number;
  targetAC: number;

  toHit: string;
  damageList: Damage[];
  advantageState: AdvantageState;

  randomness: RandomnessService;

  constructor(
    numberOfAttacks: number,
    targetAC: number,
    toHit: string,
    damageList: Damage[],
    advantageState: AdvantageState,
    randomness: RandomnessService,
  ) {
    this.numberOfAttacks = numberOfAttacks;
    this.targetAC = targetAC;
    this.toHit = toHit;
    this.damageList = damageList;
    this.advantageState = advantageState;
    this.randomness = randomness;
  }

  /**
   * Check that all necessary fields for this set of repeated attacks are set.
   * @returns whether this is a valid representation of repeated attacks
   */
  valid(): boolean {
    for (const damage of this.damageList) {
      if (!damage.valid()) {
        return false;
      }
    }

    // double-equals comparison to null checks whether fields are null or
    // undefined.
    return (
      this.numberOfAttacks != null &&
      this.numberOfAttacks >= 0 &&
      this.targetAC != null &&
      this.targetAC >= 0 &&
      this.toHit != null
    );
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
    if (!this.valid()) {
      throw new Error('Invalid configuration for repeated attacks');
    }

    let totalDmg = 0;
    let totalNumberOfHits = 0;
    const attackDetailsList = [];

    const attack = new Attack(
      this.toHit,
      this.advantageState,
      this.damageList.toArray(),
      this.randomness,
    );

    for (let i = 0; i < this.numberOfAttacks; i++) {
      const attackDetails = attack.makeAttack(this.targetAC);

      totalDmg += attackDetails.damage;
      totalNumberOfHits += attackDetails.numberOfHits;
      attackDetailsList.push(attackDetails);
    }

    return {
      numberOfAttacks: this.numberOfAttacks,
      targetAC: this.targetAC,
      toHit: attack.attackDie.modifier.prettyString(false),
      damageList: this.damageList,
      advantageState: this.advantageState,

      totalDmg: totalDmg,
      totalNumberOfHits: totalNumberOfHits,
      detailsList: attackDetailsList,
    };
  }
}
