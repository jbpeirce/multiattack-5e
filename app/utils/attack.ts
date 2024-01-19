import type RandomnessService from 'multiattack-5e/services/randomness';

import Damage from './damage';
import DiceGroupsAndModifier, {
  type GroupRollDetails,
} from './dice-groups-and-modifier';
import DiceStringParser from './dice-string-parser';
import Die from './die';

export interface AttackDetails {
  roll: GroupRollDetails;
  hit: boolean;
  crit: boolean;
  nat1: boolean;
  damage: number;
  numberOfHits: number;
  damageDetails: DamageDetails[];
}

export interface DamageDetails {
  type: string;
  dice: string;
  roll: GroupRollDetails;
  resisted: boolean;
  vulnerable: boolean;
}

export default class Attack {
  die: Die;

  toHitModifier: DiceGroupsAndModifier;

  damageTypes: Damage[];

  /**
   * Create an attack, as described in a monster's stat block or a weapon's
   * information.
   * @param toHit a string representing one or more numbers and/or dice groups
   * added to or subtracted from each other, which modifies the d20 attack roll
   * @param damageTypes a list of the damage types inflicted by this attack,
   * with details for each
   */
  constructor(
    toHit: string,
    damageTypes: Damage[],
    randomness: RandomnessService,
  ) {
    this.die = new Die(20, randomness);
    this.toHitModifier = DiceStringParser.parse(toHit, randomness);
    this.damageTypes = damageTypes;
  }

  /**
   * Make an attack on the given target, rolling all necessary dice and taking
   * advantage and disadvantage into account.
   * @param targetAC the AC of the target of this attack
   * @param advantage whether the attack has advantage
   * @param disadvantage whether the attack has disadvantage
   * @returns the attack roll and the damage inflicted by the attack
   */
  makeAttack(
    targetAC: number,
    advantage: boolean,
    disadvantage: boolean,
  ): AttackDetails {
    // Roll the d20 with advantage/disadvantage as appropriate. In addition,
    // roll any dice groups which modify the attack (such as a 1d4 from Bless or
    // -1d6 from Synaptic Static) and apply the modifiers.
    const attackRollDetails: GroupRollDetails = {
      total: 0,
      rolls: [],
    };
    const attackD20 = this.getD20Roll(advantage, disadvantage);
    attackRollDetails.total = attackD20;
    attackRollDetails.rolls.push({
      name: '1d20',
      rolls: [attackD20],
    });

    const modifierRollDetails = this.toHitModifier.roll(false);
    attackRollDetails.total += modifierRollDetails.total;
    attackRollDetails.rolls.push(...modifierRollDetails.rolls);

    const crit = attackD20 == 20;
    const nat1 = attackD20 == 1;

    let totalDmg = 0;
    let numberOfHits = 0;
    const damageDetails: DamageDetails[] = [];

    // Attacks always miss on a nat1, always hit on a crit, and otherwise hit if
    // the roll equals or exceeds the target AC.
    const hit = !nat1 && (crit || attackRollDetails.total >= targetAC);
    if (hit) {
      numberOfHits += 1;
      for (const damage of this.damageTypes) {
        const rolledDmg = damage.roll(crit);
        totalDmg += rolledDmg.total;
        damageDetails.push({
          type: `${damage.type}`,
          dice: `${damage.prettyString(crit)}`,
          roll: rolledDmg,
          resisted: damage.targetResistant,
          vulnerable: damage.targetVulnerable,
        });
      }
    }

    return {
      roll: attackRollDetails,
      hit: hit,
      crit: crit,
      nat1: nat1,
      damage: totalDmg,
      numberOfHits: numberOfHits,
      damageDetails: damageDetails,
    };
  }

  getD20Roll(advantage: boolean, disadvantage: boolean): number {
    const roll1 = this.die.roll();
    const roll2 = this.die.roll();

    if (advantage == disadvantage) {
      // If neither advantage nor disadvantage is set, or if they are both set,
      // the result is a straight roll (rolling only one die). Arbitrarily
      // choose roll1 as the outcome.
      return roll1;
    } else if (advantage) {
      return Math.max(roll1, roll2);
    } else if (disadvantage) {
      return Math.min(roll1, roll2);
    } else {
      // This should not be reachable. Of the four possible combinations, T/T
      // and F/F are handled by the first "if" statement, T/F by the second, and
      // F/T by the third. However, Typescript does not detect this and alerts
      // for a missing return statement.
      throw new Error(
        `Unexpected error when rolling d20; app logic does not handle the case where advantage=${advantage} and disadvantage=${disadvantage}. Please file an issue in Github.`,
      );
    }
  }
}
