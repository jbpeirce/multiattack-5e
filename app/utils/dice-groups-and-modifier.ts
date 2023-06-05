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
}
