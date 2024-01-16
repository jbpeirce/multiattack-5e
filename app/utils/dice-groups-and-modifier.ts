import DiceGroup from './dice-group';

export default class DiceGroupsAndModifier {
  diceGroups: DiceGroup[];
  modifier: number;

  constructor(diceGroups: DiceGroup[], modifier: number) {
    this.diceGroups = diceGroups;
    this.modifier = modifier;
  }

  /**
   * Roll all dice groups (if any), adding or subtracting them as indicated by
   * their dice groups, and add the modifier (which might be negative) to the
   * total.
   * @param doubleDice if true, roll the dice twice (though only add the
   * modifier once). This is valuable for calculating the damage from a critical
   * hit.
   * @returns the total value from rolling the dice groups described by this
   * class and adding the given modifier to them
   */
  rollAndGetTotal(doubleDice: boolean): number {
    let total = 0;
    for (const dice of this.diceGroups) {
      const sign = dice.shouldAdd() ? 1 : -1;
      total += sign * dice.roll();

      if (doubleDice) {
        total += sign * dice.roll();
      }
    }

    total += this.modifier;
    return total;
  }

  /**
   * Represent this dice group as a string, optionally doubling the number of
   * dice printed.
   *
   * @param double whether to double the number of dice being displayed (eg
   * "2d6 + 2" becomes "4d6 + 2")
   * @return a string representation of this dice group and modifier
   */
  prettyString(double: boolean): string {
    let output = '';
    let firstTerm = true;
    for (const dice of this.diceGroups) {
      // get the sign which goes before this dice group; skip the sign for the
      // first term unless it's negative
      let sign = dice.shouldAdd() ? ' + ' : ' - ';
      if (firstTerm) {
        sign = dice.shouldAdd() ? '' : '- ';
      }

      output = `${output}${sign}${dice.prettyString(double)}`;
      firstTerm = false;
    }

    let sign = this.modifier >= 0 ? ' + ' : ' - ';
    if (firstTerm) {
      sign = this.modifier >= 0 ? '' : '- ';
    }
    // Skip 0 modifiers unless they are the only term present
    if (firstTerm || this.modifier != 0) {
      output = `${output}${sign}${Math.abs(this.modifier)}`;
    }
    return output;
  }
}
