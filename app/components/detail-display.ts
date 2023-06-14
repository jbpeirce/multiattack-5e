import Component from '@glimmer/component';
import AdvantageState from './advantage-state-enum';

export default class DetailDisplayComponent extends Component {
  AdvantageState = AdvantageState;

  /**
   * Use the given toHit modifier to represent a 1d20 roll with this modifier.
   * If the input modifier has no sign at the start of the string, it will be
   * assumed to be positive.
   * @param toHit a string representing a group of dice and/or numbers added
   * together
   * @returns a string representing the toHit string added to 1d20
   */
  getAttackString = (toHit: string) => {
    toHit = toHit.trim();
    if (toHit.startsWith('+') || toHit.startsWith('-')) {
      return `1d20 ${toHit}`;
    } else {
      return `1d20 + ${toHit}`;
    }
  };
}
