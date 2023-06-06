import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Attack from 'multiattack-5e/utils/attack';
import Damage from 'multiattack-5e/utils/damage';

export default class RepeatedAttackFormComponent extends Component {
  @tracked numberOfAttacks = 0;
  @tracked targetAC = 0;

  @tracked toHit = '';
  @tracked damage = '';
  @tracked damageType = '';

  @tracked resistant = false;
  @tracked vulnerable = false;

  @tracked advantage = false;
  @tracked straightRoll = true;
  @tracked disadvantage = false;

  @tracked message = 'Currently hardcoded!';

  resetMessage = () =>
    (this.message = `Target AC: ${this.targetAC}
    Number of attacks: ${this.numberOfAttacks}
    Attack roll: 1d20 + ${this.toHit}
    ${this.advantage && !this.disadvantage ? '(rolls with advantage)' : ''}
    ${this.disadvantage && !this.advantage ? '(rolls with disadvantage)' : ''}
    ${
      this.advantage && this.disadvantage
        ? '(rolls a straight roll, with advantage and disadvantage both set)'
        : ''
    }
    Attack damage: ${this.damage} of type ${this.damageType}
    ${this.resistant ? '(target resistant)' : ''}
    ${this.vulnerable ? '(target vulnerable)' : ''}
    `);

  getDamageMessage = () => {
    const attack = new Attack(this.toHit, [
      new Damage(this.damage, this.damageType, this.resistant, this.vulnerable),
    ]);

    let totalDmg = 0;
    const attackDescriptions: string[] = [];
    for (let i = 0; i < this.numberOfAttacks; i++) {
      const attackDetails = attack.makeAttack(
        this.targetAC,
        this.advantage,
        this.disadvantage
      );

      totalDmg += attackDetails.damage;

      attackDescriptions.push(
        `Attack ${i + 1} ${
          attackDetails.hit
            ? `inflicted ${attackDetails.damage} damage`
            : 'missed'
        } with an attack roll of ${attackDetails.roll} ${
          attackDetails.crit ? '(CRIT!)' : ''
        }${attackDetails.nat1 ? '(NAT 1!)' : ''}\n`
      );
    }

    this.message += `*** Total Damage: ${totalDmg} ***\n`;
    for (const description of attackDescriptions) {
      this.message += '\t' + description;
    }
  };
}
