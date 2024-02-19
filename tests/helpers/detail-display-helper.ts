import type AdvantageState from 'multiattack-5e/components/advantage-state-enum';
import Damage, { type DamageDetails } from 'multiattack-5e/utils/damage';
import type { GroupRollDetails } from 'multiattack-5e/utils/dice-groups-and-modifier';

export interface RepeatedTestEventResult {
  numberOfRepetitions: number;
  threshold: number;
  d20Modifier: string;
  damageList: Damage[];
  advantageState: AdvantageState;
  totalDmg: number;
  totalSuccesses: number;
  detailsList: TestEventDetails[];
}

export interface TestEventDetails {
  roll: GroupRollDetails;
  success: boolean;
  majorSuccess: boolean;
  damage: number;
  damageDetails: DamageDetails[];
}
