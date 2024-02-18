import type AdvantageState from 'multiattack-5e/components/advantage-state-enum';
import type RandomnessService from 'multiattack-5e/services/randomness';

import D20WithModifiers from './d20-with-modifiers';
import Damage, { type DamageDetails } from './damage';
import { type GroupRollDetails } from './dice-groups-and-modifier';

export interface RepeatedSaveResult {
  // the parameters for this set of saves
  numberOfSaves: number;
  saveDC: number;
  modifier: string;
  advantageState: AdvantageState;
  damageList: Damage[];

  // the results of executing the repeated saves
  totalDmg: number;
  totalNumberOfPasses: number;
  saveDetailsList: SaveDetails[];
}

export interface SaveDetails {
  roll: GroupRollDetails;
  pass: boolean;
  damage: number;
  damageDetails: DamageDetails[];
}

export default class RepeatedSave {
  numberOfSaves: number;
  saveDC: number;

  // Some saves inflict damage if the save is failed; others do not, indicated
  // by an empty damage list
  rollDamageEverySave: boolean;
  saveForHalf: boolean;
  damageTypes: Damage[];

  die: D20WithModifiers;

  /**
   * Create a saving throw, with the roll modifier applied by the person
   * saving, and optional damage inflicted on a failed save.
   * @param numberOfSaves how many saves to roll
   * @param saveDC the number which must be met or exceeded to pass the save
   * @param rollModifier a string representing one or more numbers and/or dice
   * groups added to or subtracted from each other, which modifies the save's
   * d20 roll
   * @param advantageState whether the saves are rolled with advantage or
   * disadvantage
   * @param randomness a service encapsulating random number generation,
   * present to enable testing with guaranteed behavior from the dice.
   * @param rollDamageEverySave whether to roll new damage corresponding to
   * every saving throw. Will be ignored if no damage types are provided.
   * @param saveForHalf if true, passing the save results in half damage being
   * inflicted. If false, passing the save results in no damage being
   * inflicted. Will be ignored if no damage types are provided.
   * @param damageTypes a list of the damage types inflicted by this attack,
   * with details for each. Leave empty if what triggers the saving throw
   * inflicts no damage.
   */
  constructor(
    numberOfSaves: number,
    saveDC: number,
    rollModifier: string,
    advantageState: AdvantageState,
    randomness: RandomnessService,
    rollDamageEverySave: boolean = false,
    saveForHalf: boolean = false,
    damageTypes: Damage[] = [],
  ) {
    this.die = new D20WithModifiers(advantageState, rollModifier, randomness);
    this.numberOfSaves = numberOfSaves;
    this.saveDC = saveDC;

    this.rollDamageEverySave = rollDamageEverySave;
    this.saveForHalf = saveForHalf;
    this.damageTypes = damageTypes;
  }

  /**
   * Check that all necessary fields for this set of repeated saves are set.
   * @returns whether this is a valid representation of repeated saves
   */
  valid(): boolean {
    for (const damage of this.damageTypes) {
      if (!damage.valid()) {
        return false;
      }
    }

    // double-equals comparison to null should check whether fields are null or
    // undefined; the cast to string detects the case where the number has been
    // manually deleted and submitted as an empty string.
    return (
      this.numberOfSaves != null &&
      this.numberOfSaves >= 0 &&
      this.numberOfSaves.toString().length > 0 &&
      this.saveDC != null &&
      this.saveDC >= 0 &&
      this.saveDC.toString().length > 0
    );
  }

  /**
   * Simulate saves against a specified difficulty (DC), with the details of the
   * saves specified by the constructor for this class. This method may
   * produce significantly different results on repeated calls, since it relies
   * heavily on the randomness of simulated dice.
   *
   * @returns a summary of the result of simulating repeated saves with the
   * given parameters
   */
  simulateRepeatedSaves(): RepeatedSaveResult {
    if (!this.valid()) {
      throw new Error('Invalid configuration for repeated saves');
    }

    let totalNumberOfPasses = 0;
    const totalDamage = 0;
    const saveDetailsList = [];

    for (let i = 0; i < this.numberOfSaves; i++) {
      const saveRoll = this.die.roll();

      const saveDetail: SaveDetails = {
        roll: {
          total: saveRoll.total,
          rolls: saveRoll.rolls,
        },
        pass: false,
        damage: 0,
        damageDetails: [],
      };

      if (saveRoll.total >= this.saveDC) {
        saveDetail.pass = true;
        totalNumberOfPasses += 1;

        // TODO: Handle damage, including half damage inflicted on a pass
      }

      saveDetailsList.push(saveDetail);
    }

    return {
      numberOfSaves: this.numberOfSaves,
      saveDC: this.saveDC,
      modifier: this.die.modifier.prettyString(false),
      damageList: this.damageTypes,
      advantageState: this.die.advantageState,

      totalDmg: totalDamage,
      totalNumberOfPasses: totalNumberOfPasses,
      saveDetailsList: saveDetailsList,
    };
  }
}
