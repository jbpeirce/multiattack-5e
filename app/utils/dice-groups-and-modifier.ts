import DiceGroup from './dice-group';

export interface GroupRollDetails {
  total: number;
  rolls: NameAndRolls[];
}

export interface NameAndRolls {
  name: string;
  rolls: number[];
}

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
   * class and adding the given modifier to them, alongside details of each roll.
   */
  roll(doubleDice: boolean): GroupRollDetails {
    const details: GroupRollDetails = {
      total: 0,
      rolls: [],
    };

    for (const dice of this.diceGroups) {
      const rolls = [];
      const sign = dice.shouldAdd() ? 1 : -1;

      // Roll the dice once or twice, as instructed
      const repetitions = doubleDice ? 2 : 1;
      for (let i = 0; i < repetitions; i++) {
        const roll = dice.roll();
        details.total += sign * roll.total;
        rolls.push(...roll.rolls);
      }

      const signString = dice.shouldAdd() ? '' : '-';
      const diceName = `${signString}${dice.prettyString(doubleDice)}`;
      details.rolls.push({
        name: diceName,
        rolls: rolls,
      });
    }

    // Once all dice are rolled, add the modifier to the total
    details.total += this.modifier;

    return details;
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
