export default class DieModel {
  sides: number;

  constructor(sides: number) {
    if (sides < 1) {
      throw new Error('Die must have a positive number of sides');
    }
    this.sides = sides;
  }

  /**
   * @returns a number between 1 and the number of sides on this
   * die, as though rolling a physical die
   */
  roll(): number {
    return Math.floor(Math.random() * this.sides) + 1;
  }
}
