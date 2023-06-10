import Component from '@glimmer/component';
import DiceStringParser from 'multiattack-5e/utils/dice-string-parser';

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

  diceGroupsRegex = DiceStringParser.diceStringRegexAsString;
}
