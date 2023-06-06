import Damage from './damage';
import DiceGroupsAndModifier from './dice-groups-and-modifier';
import DiceStringParser from './dice-string-parser';
import Die from './die';

export interface AttackDetails {
  roll: number;
  hit: boolean;
  crit: boolean;
  nat1: boolean;
  damage: number;
  damageDetails: Map<string, number>;
}

export default class Attack {
  die = new Die(20);

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
  constructor(toHit: string, damageTypes: Damage[]) {
    this.toHitModifier = new DiceStringParser().parse(toHit);
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
    disadvantage: boolean
  ): AttackDetails {
    // Roll the d20 with advantage/disadvantage as appropriate. In addition,
    // roll any dice groups which modify the attack (such as a 1d4 from Bless or
    // -1d6 from Synaptic Static) and apply the fixed modifiers.
    const attackD20 = this.getD20Roll(advantage, disadvantage);
    const attackRoll = attackD20 + this.toHitModifier.rollAndGetTotal(false);

    const crit = attackD20 == 20;
    const nat1 = attackD20 == 1;

    let totalDmg = 0;
    const damageDetails = new Map();

    // Attacks always miss on a nat1, always hit on a crit, and otherwise hit if
    // the roll equals or exceeds the target AC.
    const hit = !nat1 && (crit || attackRoll >= targetAC);
    if (hit) {
      for (const damage of this.damageTypes) {
        const rolledDmg = damage.roll(crit);
        totalDmg += rolledDmg;
        // This will overwrite a damage record if the attack has multiple damage
        // components of the same type with the same damage string, but this is
        // unlikely
        damageDetails.set(`${damage.type} (${damage.damageString})`, rolledDmg);
      }
    }

    return {
      roll: attackRoll,
      hit: hit,
      crit: crit,
      nat1: nat1,
      damage: totalDmg,
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
        `Unexpected error when rolling d20; app logic does not handle the case where advantage=${advantage} and disadvantage=${disadvantage}. Please file an issue in Github.`
      );
    }
  }
}
