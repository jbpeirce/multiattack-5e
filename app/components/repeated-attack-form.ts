import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Attack from 'multiattack-5e/utils/attack';
import Damage from 'multiattack-5e/utils/damage';
import AdvantageState from './advantage-state';
import { assert } from '@ember/debug';

export default class RepeatedAttackFormComponent extends Component {
  @tracked numberOfAttacks = 0;
  @tracked targetAC = 0;

  @tracked toHit = '5 + 1d4';
  damage = '2d6 + 3';
  damageType = 'piercing';

  resistant = false;
  vulnerable = false;

  @tracked message = this.getAttackDetails();

  advantageState = AdvantageState.STRAIGHT;

  @action
  setAdvantageState(newState: AdvantageState) {
    assert(
      'advantage state handler must receive an advantage state',
      newState instanceof AdvantageState
    );
    this.advantageState = newState;
  }

  @action
  setDamageType(newType: InputEvent) {
    assert(
      'damage type handler must receive an event with a target that is an HTMLSelectElement',
      newType.target instanceof HTMLSelectElement
    );
    this.damageType = newType.target.value.toLowerCase() || 'piercing';
  }

  @action
  setDamage(newDamage: InputEvent) {
    assert(
      'damage handler must receive an event with a target that is an HTMLInputElement',
      newDamage.target instanceof HTMLInputElement
    );

    this.damage = newDamage.target.value || '2d6 + 3';
  }

  @action
  setResistant(newResistant: InputEvent) {
    assert(
      'resistance handler must receive an event with a target that is an HTMLInputElement',
      newResistant.target instanceof HTMLInputElement
    );
    this.resistant = newResistant.target.checked || false;
  }

  @action
  setVulnerable(newVulnerable: InputEvent) {
    assert(
      'vulnerability handler must receive an event with a target that is an HTMLInputElement',
      newVulnerable.target instanceof HTMLInputElement
    );
    this.vulnerable = newVulnerable.target.checked || false;
  }

  getAttackDetailsMessage = () => (this.message = this.getAttackDetails());

  getDamageMessage = () => {
    const attack = new Attack(this.toHit, [
      new Damage(this.damage, this.damageType, this.resistant, this.vulnerable),
    ]);

    let totalDmg = 0;
    const attackDescriptions: string[] = [];
    for (let i = 0; i < this.numberOfAttacks; i++) {
      const attackDetails = attack.makeAttack(
        this.targetAC,
        this.advantageState == AdvantageState.ADVANTAGE,
        this.advantageState == AdvantageState.DISADVANTAGE
      );

      totalDmg += attackDetails.damage;

      attackDescriptions.push(
        `Attack ${i + 1} ${
          attackDetails.hit
            ? `inflicted ${attackDetails.damage} damage`
            : 'missed'
        } with an attack roll of ${attackDetails.roll}${
          attackDetails.crit ? ' (CRIT!)' : ''
        }${attackDetails.nat1 ? ' (NAT 1!)' : ''}\n`
      );
    }

    this.message = this.getAttackDetails();
    this.message += `\n*** Total Damage: ${totalDmg} ***\n`;
    for (const description of attackDescriptions) {
      this.message += '\t' + description;
    }
  };

  getAttackDetails(): string {
    return (
      `Target AC: ${this.targetAC}\n` +
      `Number of attacks: ${this.numberOfAttacks}\n` +
      `Attack roll: 1d20 + ${this.toHit}\n` +
      `${
        this.advantageState == AdvantageState.ADVANTAGE
          ? '(rolls with advantage)\n'
          : ''
      }` +
      `${
        this.advantageState == AdvantageState.DISADVANTAGE
          ? '(rolls with disadvantage)\n'
          : ''
      }` +
      `Attack damage: ${this.damage} ${this.damageType} damage` +
      `${this.resistant ? '\n(target resistant)' : ''}` +
      `${this.vulnerable ? '\n(target vulnerable)' : ''}`
    );
  }
}
