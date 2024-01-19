import Service from '@ember/service';

export default class RandomnessService extends Service {
  /**
   * Return a pseudorandom number between 0 and 1. This is typically
   * implemented using Math.random() or a similar tool, but can be overridden
   * to hardcode randomness during tests.
   * @returns a pseudorandom number between 0 and 1
   */
  random() {
    return Math.random();
  }
}
