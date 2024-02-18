import AdvantageState from 'multiattack-5e/components/advantage-state-enum';
import RandomnessService from 'multiattack-5e/services/randomness';

import type { NameAndRolls } from './dice-groups-and-modifier';
import type DiceGroupsAndModifier from './dice-groups-and-modifier';
import DiceStringParser from './dice-string-parser';
import Die from './die';

export interface D20RollDetails {
  total: number;
  // Tracks the number on the initial d20, distinct from any d20 which may be
  // present in the modifiers
  baseD20Roll: number;
  rolls: NameAndRolls[];
}

export default class D20WithModifiers {
  die: Die;
  advantageState: AdvantageState;
  modifier: DiceGroupsAndModifier;

  constructor(
    advantageState: AdvantageState,
    modifier: string,
    randomness: RandomnessService,
  ) {
    this.die = new Die(20, randomness);
    this.advantageState = advantageState;
    this.modifier = DiceStringParser.parse(modifier, randomness);
  }

  /**
   * Roll a d20 with advantage or disadvantage if applicable. In addition, roll
   * any dice groups which modify the roll (such as a 1d4 from Bless or -1d6
   * from Synaptic Static) and add them to the result.
   * @returns the result of rolling a d20 with the specified modifiers and
   * advantage state
   */
  roll(): D20RollDetails {
    const rollDetails: D20RollDetails = {
      total: 0,
      baseD20Roll: 0,
      rolls: [],
    };

    // Roll the d20, with advantage or disadvantage as indicated
    const d20Roll = this.getD20Roll();
    rollDetails.total = d20Roll;
    rollDetails.baseD20Roll = d20Roll;
    rollDetails.rolls.push({
      name: '1d20',
      rolls: [d20Roll],
    });

    // Roll modifiers
    const modifierRollDetails = this.modifier.roll(false);
    rollDetails.total += modifierRollDetails.total;
    rollDetails.rolls.push(...modifierRollDetails.rolls);
    return rollDetails;
  }

  getD20Roll(): number {
    const roll1 = this.die.roll();
    const roll2 = this.die.roll();

    switch (this.advantageState) {
      case AdvantageState.STRAIGHT:
        return roll1;
      case AdvantageState.ADVANTAGE:
        return Math.max(roll1, roll2);
      case AdvantageState.DISADVANTAGE:
        return Math.min(roll1, roll2);
      default:
        // This should not be reachable.
        throw new Error(
          `Unexpected error when rolling d20; app logic does not handle advantage state ${this.advantageState}. Please file an issue in Github.`,
        );
    }
  }
}
