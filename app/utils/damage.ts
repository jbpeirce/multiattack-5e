import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import DiceGroupsAndModifier from './dice-groups-and-modifier';
import DiceStringParser from './dice-string-parser';

export default class Damage {
  @tracked type: string;

  @tracked damageString: string;
  damageParsingErrored = false;
  damage = new DiceGroupsAndModifier([], 0);

  @tracked targetResistant: boolean;
  @tracked targetVulnerable: boolean;

  constructor(
    damageString: string,
    type: string,
    targetResistant = false,
    targetVulnerable = false,
  ) {
    this.parseDamageString(damageString);
    this.damageString = damageString;
    this.type = type;
    this.targetResistant = targetResistant;
    this.targetVulnerable = targetVulnerable;
  }

  parseDamageString(damageString: string) {
    try {
      this.damage = DiceStringParser.parse(damageString);
      this.damageParsingErrored = false;
    } catch (e) {
      this.damage = new DiceGroupsAndModifier([], 0);
      this.damageParsingErrored = true;
      throw e;
    }
  }

  @action
  setDamageType(newType: InputEvent) {
    assert(
      'damage type handler must receive an event with a target that is an HTMLSelectElement',
      newType.target instanceof HTMLSelectElement,
    );
    this.type = newType.target.value;
  }

  @action
  setDamage(newDamage: InputEvent) {
    assert(
      'damage handler must receive an event with a target that is an HTMLInputElement',
      newDamage.target instanceof HTMLInputElement,
    );

    this.damageString = newDamage.target.value;
    this.parseDamageString(this.damageString);
  }

  @action
  setResistant(newResistant: InputEvent) {
    assert(
      'resistance handler must receive an event with a target that is an HTMLInputElement',
      newResistant.target instanceof HTMLInputElement,
    );
    this.targetResistant = newResistant.target.checked || false;
  }

  @action
  setVulnerable(newVulnerable: InputEvent) {
    assert(
      'vulnerability handler must receive an event with a target that is an HTMLInputElement',
      newVulnerable.target instanceof HTMLInputElement,
    );
    this.targetVulnerable = newVulnerable.target.checked || false;
  }

  /**
   * Check that all necessary fields for this damage are set.
   * @returns whether this is a valid representation of damage
   */
  valid(): boolean {
    // double-equals comparison to null should check whether fields are null or
    // undefined
    return (
      this.damage != null &&
      !this.damageParsingErrored &&
      this.damageString != null &&
      this.damageString.length > 0 &&
      this.type != null &&
      this.type.length > 0
    );
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
    if (!this.valid()) {
      throw new Error('Damage did not have all necessary fields set');
    }

    let total = this.damage.roll(crit).total;

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

  /**
   * Display this damage as a string. If the attack was a critical hit, double
   * the number of dice displayed (eg "2d6 + 1d4 + 3" becomes "4d6 + 2d4 + 3").
   * @param crit: whether this attack was a critical hit
   * @returns a string representation of the damage inflicted by an attack
   * described by this class
   */
  prettyString(crit: boolean): string {
    return this.damage.prettyString(crit);
  }
}
