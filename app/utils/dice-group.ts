import Die from 'multiattack-5e/utils/die';

export default class DiceGroup {
  numDice: number;
  die: Die;
  add: boolean;

  constructor(numDice: number, numSides: number, add = true) {
    if (numDice < 0) {
      throw new Error('Number of dice in group must be non-negative');
    }

    this.numDice = numDice;
    this.die = new Die(numSides);
    this.add = add;
  }

  /**
   * Roll all of the dice in this group (which are identical to each other) and
   * return the total
   *
   * @returns the total from rolling all of the dice in this group
   */
  roll(): number {
    let total = 0;
    for (let i = 0; i < this.numDice; i++) {
      total += this.die.roll();
    }
    return total;
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
}
