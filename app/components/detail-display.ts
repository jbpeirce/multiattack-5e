import Component from '@glimmer/component';

import type { NameAndRolls } from 'multiattack-5e/utils/dice-groups-and-modifier';

import AdvantageState from './advantage-state-enum';

export default class DetailDisplayComponent extends Component {
  AdvantageState = AdvantageState;

  /**
   * Use the given modifier to represent a 1d20 roll with this modifier.
   * If the input modifier has no sign at the start of the string, it will be
   * assumed to be positive.
   * @param modifier a string representing a group of dice and/or numbers added
   * together
   * @returns a string representing the modifier string added to 1d20
   */
  getD20String = (modifier: string) => {
    modifier = modifier.trim();
    if (modifier.startsWith('+') || modifier.startsWith('-')) {
      return `1d20 ${modifier}`;
    } else {
      return `1d20 + ${modifier}`;
    }
  };

  /**
   * Get a string displaying the given set of roll details.
   * @param rollDetails information about the rolls from one or more groups of
   * dice
   * @returns a string pairing the name of each group of dice with the
   * associated rolls
   */
  getRollDetailString = (rollDetails: NameAndRolls[]) => {
    return rollDetails
      .map((roll) => `${roll.name}: ${roll.rolls.join(', ')}`)
      .join(' | ');
  };

  /**
   * Get a string listing the given numbers with spaces between them (unlike
   * the default string method for an array).
   * @param array an array of numbers
   * @returns a string containing the numbers separated by spaces
   */
  getStringWithSpaces = (array: number[]) => {
    return array.join(', ');
  };
}
