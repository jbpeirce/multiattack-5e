export default class DamageType {
  static ACID = new DamageType('acid');
  static BLUDGEONING = new DamageType('bludgeoning');
  static COLD = new DamageType('cold');
  static FIRE = new DamageType('fire');
  static FORCE = new DamageType('force');
  static LIGHTNING = new DamageType('lightning');
  static NECROTIC = new DamageType('necrotic');
  static PIERCING = new DamageType('piercing');
  static POISON = new DamageType('poison');
  static PSYCHIC = new DamageType('psychic');
  static RADIANT = new DamageType('radiant');
  static SLASHING = new DamageType('slashing');
  static THUNDER = new DamageType('thunder');
  static OTHER = new DamageType('other');

  name: string;

  constructor(name: string) {
    this.name = name;
  }
}
