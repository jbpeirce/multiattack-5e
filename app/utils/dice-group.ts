import type RandomnessService from 'multiattack-5e/services/randomness';
import Die from 'multiattack-5e/utils/die';

export interface RollDetails {
  total: number;
  rolls: number[];
}

export default class DiceGroup {
  numDice: number;
  die: Die;
  add: boolean;

  constructor(
    numDice: number,
    numSides: number,
    randomness: RandomnessService,
    add = true,
  ) {
    if (numDice < 0) {
      throw new Error('Number of dice in group must be non-negative');
    }

    this.numDice = numDice;
    this.die = new Die(numSides, randomness);
    this.add = add;
  }

  /**
   * Roll all of the dice in this group (which are identical to each other) and
   * return the total
   *
   * @returns the total from rolling all of the dice in this group
   */
  roll(): RollDetails {
    const details: RollDetails = {
      total: 0,
      rolls: [],
    };

    for (let i = 0; i < this.numDice; i++) {
      const roll = this.die.roll();
      details.total += roll;
      details.rolls.push(roll);
    }
    return details;
  }

  /**
   * Indicate whether this group should be added or subtracted from a total; for
   * instance, if an attack's damage is described as "2d6 - 1d4", 2d6 would
   * return "true" and 1d4 would return "false".
   * @returns true if this group should be added to a total; false if this
   * should be subtracted from the total
   */
  shouldAdd(): boolean {
    return this.add;
  }

  /**
   * Represent this dice group as a string, optionally doubling the number of
   * dice printed.
   *
   * @param double whether to double the number of dice being displayed (eg
   * "2d6" becomes "4d6")
   * @return a string representation of this group of dice
   */
  prettyString(double: boolean): string {
    const dice = double ? 2 * this.numDice : this.numDice;
    return `${dice}d${this.die.sides}`;
  }
}
