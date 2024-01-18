import Component from '@glimmer/component';

import AdvantageState from './advantage-state-enum';

export default class AdvantageRadioComponent extends Component {
  AdvantageState = AdvantageState;

  states = [
    AdvantageState.ADVANTAGE,
    AdvantageState.STRAIGHT,
    AdvantageState.DISADVANTAGE,
  ];

  /**
   * Indicate whether this state should have its radio button checked by default
   * @param the name of an advantage state labeling a radio button
   * @return whether this state should be checked in the UI's radio button by
   * default
   */
  getChecked = (stateName: string) => {
    if (stateName == AdvantageState.STRAIGHT.name) {
      return true;
    }
    return false;
  };
}
