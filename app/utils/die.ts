import RandomnessService from 'multiattack-5e/services/randomness';

export default class Die {
  sides: number;
  randomness: RandomnessService;

  constructor(sides: number, randomness: RandomnessService) {
    if (sides < 1) {
      throw new Error('Die must have a positive number of sides');
    }
    this.sides = sides;
    this.randomness = randomness;
  }

  /**
   * @returns a number between 1 and the number of sides on this
   * die, as though rolling a physical die
   */
  roll(): number {
    return Math.floor(this.randomness.random() * this.sides) + 1;
  }
}
