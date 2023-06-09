export default class AdvantageState {
  static ADVANTAGE = new AdvantageState('advantage');
  static STRAIGHT = new AdvantageState('straight');
  static DISADVANTAGE = new AdvantageState('disadvantage');

  name: string;

  constructor(name: string) {
    this.name = name;
  }
}
