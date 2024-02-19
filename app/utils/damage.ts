import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import type RandomnessService from 'multiattack-5e/services/randomness';

import { DamageDetails } from './damage-details';
import DiceGroupsAndModifier from './dice-groups-and-modifier';
import DiceStringParser from './dice-string-parser';

export default class Damage {
  @tracked type: string;

  @tracked damageString: string;
  damageParsingErrored = false;
  damage = new DiceGroupsAndModifier([], 0);

  @tracked targetResistant: boolean;
  @tracked targetVulnerable: boolean;

  randomness: RandomnessService;

  constructor(
    damageString: string,
    type: string,
    randomness: RandomnessService,
    targetResistant = false,
    targetVulnerable = false,
  ) {
    this.randomness = randomness;

    this.parseDamageString(damageString);
    this.damageString = damageString;
    this.type = type;
    this.targetResistant = targetResistant;
    this.targetVulnerable = targetVulnerable;
  }

  parseDamageString(damageString: string) {
    try {
      this.damage = DiceStringParser.parse(damageString, this.randomness);
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
   * @returns the total damage inflicted by an attack described by this class,
   * and the dice rolls involved
   */
  roll(crit: boolean): DamageDetails {
    if (!this.valid()) {
      throw new Error('Damage did not have all necessary fields set');
    }

    const damageRoll = this.damage.roll(crit);

    // Reset the total to 0 if it is negative (which may happen due to a
    // negative damage modifier)
    damageRoll.total = Math.max(damageRoll.total, 0);

    return new DamageDetails(
      this.type,
      this.damage.prettyString(crit),
      damageRoll,
      this.targetResistant,
      this.targetVulnerable,
    );
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
