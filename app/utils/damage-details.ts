import { type GroupRollDetails } from './dice-groups-and-modifier';

/**
 * An interface pairing the damage inflicted in a specific context with the
 * associated damage details. This will be used for attacks or saves to display
 * the details of inflicted damage.
 */
export interface InflictedDamageDetails {
  inflicted: number;
  details: DamageDetails;
}

export class DamageDetails {
  type: string;
  dice: string;
  roll: GroupRollDetails;
  resisted: boolean;
  vulnerable: boolean;

  constructor(
    type: string,
    dice: string,
    roll: GroupRollDetails,
    resisted: boolean,
    vulnerable: boolean,
  ) {
    this.type = type;
    this.dice = dice;
    this.roll = roll;
    this.resisted = resisted;
    this.vulnerable = vulnerable;
  }

  /**
   * Get the total damage inflicted by the dice rolls for this class. This
   * applies resistance, vulnerability, and optionally an additional specified
   * modifier to the damage rolled on the dice, in the order (modifier,
   * resistance, vulnerability). This means that if some other factor affects
   * the amount of damage inflicted, such as passing a save against a
   * save-for-half spell like Fireball, that alteration is applied before
   * resistance and vulnerability.
   * @param [multiplier = 1] an optional multiplier which should be applied to
   * the total rolled damage before resistance or vulnerability
   */
  getInflictedDamage(multiplier = 1): number {
    let inflicted = this.roll.total;

    // Apply the input multiplier on the damage (which will default to 1).
    // Round down in case the multiplier is fractional.
    inflicted = Math.floor(inflicted * multiplier);

    if (this.resisted) {
      inflicted = Math.floor(inflicted / 2);
    }

    if (this.vulnerable) {
      inflicted = inflicted * 2;
    }

    return inflicted;
  }
}
