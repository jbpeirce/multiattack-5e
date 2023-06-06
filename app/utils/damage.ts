import DiceGroupsAndModifier from './dice-groups-and-modifier';
import DiceStringParser from './dice-string-parser';

export default class Damage {
  type: string;

  damageString: string;
  damage: DiceGroupsAndModifier;

  targetResistant: boolean;
  targetVulnerable: boolean;

  constructor(
    damageString: string,
    type: string,
    targetResistant = false,
    targetVulnerable = false
  ) {
    this.damage = new DiceStringParser().parse(damageString);
    this.damageString = damageString;
    this.type = type;
    this.targetResistant = targetResistant;
    this.targetVulnerable = targetVulnerable;
  }

  /**
   * Calculate the damage inflicted by an attack described by this class. This
   * simulates rolling the dice (if applicable) and takes target resistance and
   * vulnerability into account when finding the total amount of damage
   * inflicted. If the attack was a critical hit, the number of dice rolled will
   * be doubled
   * @param crit: whether this attack was a critical hit
   * @returns the damage inflicted by an attack described by this class
   */
  roll(crit: boolean) {
    let total = this.damage.rollAndGetTotal(crit);

    // Reset the total to 0 if it is negative (which may happen due to a
    // negative damage modifier)
    total = Math.max(total, 0);

    if (this.targetResistant) {
      total = Math.floor(total / 2);
    }

    if (this.targetVulnerable) {
      total = total * 2;
    }

    return total;
  }
}
