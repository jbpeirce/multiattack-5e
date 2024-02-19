import type AdvantageState from 'multiattack-5e/components/advantage-state-enum';
import type RandomnessService from 'multiattack-5e/services/randomness';

import D20WithModifiers from './d20-with-modifiers';
import Damage from './damage';
import { type InflictedDamageDetails } from './damage-details';
import { type GroupRollDetails } from './dice-groups-and-modifier';

export interface AttackDetails {
  roll: GroupRollDetails;
  hit: boolean;
  crit: boolean;
  nat1: boolean;
  damage: number;
  numberOfHits: number;
  damageDetails: InflictedDamageDetails[];
}

export default class Attack {
  attackDie: D20WithModifiers;

  damageTypes: Damage[];

  /**
   * Create an attack, as described in a monster's stat block or a weapon's
   * information.
   * @param toHit a string representing one or more numbers and/or dice groups
   * added to or subtracted from each other, which modifies the d20 attack roll
   * @param advantageState whether this attack is rolled with advantage
   * @param damageTypes a list of the damage types inflicted by this attack,
   * with details for each
   * @param randomness a service to introduce randomness for dice, used to
   * control dice behavior in tests
   */
  constructor(
    toHit: string,
    advantageState: AdvantageState,
    damageTypes: Damage[],
    randomness: RandomnessService,
  ) {
    this.attackDie = new D20WithModifiers(advantageState, toHit, randomness);
    this.damageTypes = damageTypes;
  }

  /**
   * Make an attack on the given target, rolling all necessary dice and taking
   * advantage and disadvantage into account.
   * @param targetAC the AC of the target of this attack
   * @returns the attack roll and the damage inflicted by the attack
   */
  makeAttack(targetAC: number): AttackDetails {
    // Roll the attack d20 with advantage/disadvantage and any applicable
    // modifiers
    const attackRoll = this.attackDie.roll();

    const crit = attackRoll.baseD20Roll == 20;
    const nat1 = attackRoll.baseD20Roll == 1;

    let totalDmg = 0;
    let numberOfHits = 0;
    const damageDetails: InflictedDamageDetails[] = [];

    // Attacks always miss on a nat1, always hit on a crit, and otherwise hit if
    // the roll equals or exceeds the target AC.
    const hit = !nat1 && (crit || attackRoll.total >= targetAC);
    if (hit) {
      numberOfHits += 1;
      for (const damage of this.damageTypes) {
        const dmg = damage.roll(crit);
        totalDmg += dmg.getInflictedDamage();
        damageDetails.push({
          inflicted: dmg.getInflictedDamage(),
          details: dmg,
        });
      }
    }

    return {
      roll: {
        total: attackRoll.total,
        rolls: attackRoll.rolls,
      },
      hit: hit,
      crit: crit,
      nat1: nat1,
      damage: totalDmg,
      numberOfHits: numberOfHits,
      damageDetails: damageDetails,
    };
  }
}
