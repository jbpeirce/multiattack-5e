import { action } from '@ember/object';
import DiceGroupsAndModifier from './dice-groups-and-modifier';
import DiceStringParser from './dice-string-parser';
import { assert } from '@ember/debug';
import { tracked } from '@glimmer/tracking';

export default class Damage {
  @tracked type: string;

  @tracked damageString: string;
  damage: DiceGroupsAndModifier;

  @tracked targetResistant: boolean;
  @tracked targetVulnerable: boolean;

  constructor(
    damageString: string,
    type: string,
    targetResistant = false,
    targetVulnerable = false
  ) {
    this.damage = DiceStringParser.parse(damageString);
    this.damageString = damageString;
    this.type = type;
    this.targetResistant = targetResistant;
    this.targetVulnerable = targetVulnerable;
  }

  @action
  setDamageType(newType: InputEvent) {
    assert(
      'damage type handler must receive an event with a target that is an HTMLSelectElement',
      newType.target instanceof HTMLSelectElement
    );
    this.type = newType.target.value || 'Piercing';
  }

  @action
  setDamage(newDamage: InputEvent) {
    assert(
      'damage handler must receive an event with a target that is an HTMLInputElement',
      newDamage.target instanceof HTMLInputElement
    );

    this.damageString = newDamage.target.value || '0';
    this.damage = DiceStringParser.parse(this.damageString);
  }

  @action
  setResistant(newResistant: InputEvent) {
    assert(
      'resistance handler must receive an event with a target that is an HTMLInputElement',
      newResistant.target instanceof HTMLInputElement
    );
    this.targetResistant = newResistant.target.checked || false;
  }

  @action
  setVulnerable(newVulnerable: InputEvent) {
    assert(
      'vulnerability handler must receive an event with a target that is an HTMLInputElement',
      newVulnerable.target instanceof HTMLInputElement
    );
    this.targetVulnerable = newVulnerable.target.checked || false;
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
