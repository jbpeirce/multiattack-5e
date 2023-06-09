import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class DamageTypeComponent extends Component {
  damageTypes = [
    'Acid',
    'Bludgeoning',
    'Cold',
    'Fire',
    'Force',
    'Lightning',
    'Necrotic',
    'Piercing',
    'Poison',
    'Psychic',
    'Radiant',
    'Slashing',
    'Thunder',
    'Other',
  ];

  @tracked damage = '2d6 + 7';
  @tracked damageType = 'Piercing';

  @tracked resistant = false;
  @tracked vulnerable = false;
}
