export default class SaveDamageHandlingState {
  // pass: no damage; fail: full damage
  static NO_DAMAGE_ON_PASS = new SaveDamageHandlingState('no-damage');

  // pass: half damage; fail: full damage
  static HALF_DAMAGE_ON_PASS = new SaveDamageHandlingState('half-damage');

  // pass: no damage; fail: half damage
  static EVASION = new SaveDamageHandlingState('evasion');

  name: string;

  constructor(name: string) {
    this.name = name;
  }
}
