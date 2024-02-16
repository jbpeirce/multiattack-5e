import AdvantageState from 'multiattack-5e/components/advantage-state-enum';
import RandomnessService from 'multiattack-5e/services/randomness';

import Die from './die';

export default class D20WithAdvantageState {
  die: Die;
  advantageState: AdvantageState;

  constructor(advantageState: AdvantageState, randomness: RandomnessService) {
    this.die = new Die(20, randomness);
    this.advantageState = advantageState;
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
