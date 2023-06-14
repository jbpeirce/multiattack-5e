import Component from '@glimmer/component';

import DiceStringParser from 'multiattack-5e/utils/dice-string-parser';

import DamageType from './damage-type-enum';

export default class DamageTypeComponent extends Component {
  damageTypes = [
    DamageType.ACID,
    DamageType.BLUDGEONING,
    DamageType.COLD,
    DamageType.FIRE,
    DamageType.FORCE,
    DamageType.LIGHTNING,
    DamageType.NECROTIC,
    DamageType.PIERCING,
    DamageType.POISON,
    DamageType.PSYCHIC,
    DamageType.RADIANT,
    DamageType.SLASHING,
    DamageType.THUNDER,
    DamageType.OTHER,
  ];

  diceGroupsRegex = DiceStringParser.diceStringRegexAsString;
}
