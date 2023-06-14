import Component from '@glimmer/component';
import AdvantageState from './advantage-state-enum';

export default class AdvantageRadioComponent extends Component {
  AdvantageState = AdvantageState;

  states = [
    AdvantageState.ADVANTAGE,
    AdvantageState.STRAIGHT,
    AdvantageState.DISADVANTAGE,
  ];
}
