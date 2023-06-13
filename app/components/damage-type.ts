import Component from '@glimmer/component';
import DiceStringParser from 'multiattack-5e/utils/dice-string-parser';

export default class DamageTypeComponent extends Component {
  damageTypes = [
    'acid',
    'bludgeoning',
    'cold',
    'fire',
    'force',
    'lightning',
    'necrotic',
    'piercing',
    'poison',
    'psychic',
    'radiant',
    'slashing',
    'thunder',
    'other',
  ];

  diceGroupsRegex = DiceStringParser.diceStringRegexAsString;
}
