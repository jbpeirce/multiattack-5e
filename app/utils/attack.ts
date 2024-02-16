import type AdvantageState from 'multiattack-5e/components/advantage-state-enum';
import type RandomnessService from 'multiattack-5e/services/randomness';

import D20WithAdvantageState from './d20-with-advantage-state';
import Damage from './damage';
import DiceGroupsAndModifier, {
  type GroupRollDetails,
} from './dice-groups-and-modifier';
import DiceStringParser from './dice-string-parser';

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
  die: D20WithAdvantageState;

  toHitModifier: DiceGroupsAndModifier;

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
    this.die = new D20WithAdvantageState(advantageState, randomness);
    this.toHitModifier = DiceStringParser.parse(toHit, randomness);
    this.damageTypes = damageTypes;
  }

  /**
   * Make an attack on the given target, rolling all necessary dice and taking
   * advantage and disadvantage into account.
   * @param targetAC the AC of the target of this attack
   * @returns the attack roll and the damage inflicted by the attack
   */
  makeAttack(targetAC: number): AttackDetails {
    // Roll the attack d20 with advantage/disadvantage. In addition,
    // roll any dice groups which modify the attack (such as a 1d4 from Bless or
    // -1d6 from Synaptic Static) and apply the modifiers.
    const attackRollDetails: GroupRollDetails = {
      total: 0,
      rolls: [],
    };
    const attackD20Roll = this.die.getD20Roll();
    attackRollDetails.total = attackD20Roll;
    attackRollDetails.rolls.push({
      name: '1d20',
      rolls: [attackD20Roll],
    });

    const modifierRollDetails = this.toHitModifier.roll(false);
    attackRollDetails.total += modifierRollDetails.total;
    attackRollDetails.rolls.push(...modifierRollDetails.rolls);

    const crit = attackD20Roll == 20;
    const nat1 = attackD20Roll == 1;

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
}
