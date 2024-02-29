import type AdvantageState from 'multiattack-5e/components/advantage-state-enum';
import type RandomnessService from 'multiattack-5e/services/randomness';

import D20WithModifiers from './d20-with-modifiers';
import Damage from './damage';
import {
  type DamageDetails,
  type InflictedDamageDetails,
} from './damage-details';
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
  detailsList: SaveDetails[];
}

export interface SaveDetails {
  roll: GroupRollDetails;
  pass: boolean;
  damage: number;
  damageDetails: InflictedDamageDetails[];
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
    const saveDetailsList: SaveDetails[] = [];

    let totalDamage = 0;
    const cachedDamageDetails: DamageDetails[] = [];

    // Precompute the damage if it will not be rolled every save. This will not
    // throw errors if the damage list is empty; it will simply return 0 damage
    // and an empty list of details.
    if (!this.rollDamageEverySave) {
      for (const damage of this.damageTypes) {
        cachedDamageDetails.push(damage.roll(false));
      }
    }

    // Roll all saves
    for (let i = 0; i < this.numberOfSaves; i++) {
      // Get the damage that might be inflicted by this save
      let damageDetails = [];
      if (this.rollDamageEverySave) {
        for (const damage of this.damageTypes) {
          damageDetails.push(damage.roll(false));
        }
      } else {
        damageDetails = cachedDamageDetails;
      }

      // Roll the d20 for the saving throw
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

      // Handle pass or failure of the save
      if (saveRoll.total >= this.saveDC) {
        saveDetail.pass = true;
        totalNumberOfPasses += 1;

        // Some saving throws inflict half damage when a save is passed
        if (this.saveForHalf) {
          const totalInflictedBySave = this.getTotalInflictedDamage(
            damageDetails,
            saveDetail.damageDetails,
            0.5,
          );

          totalDamage += totalInflictedBySave;
          saveDetail.damage = totalInflictedBySave;
        }
      } else {
        // When a save is failed, inflict full damage (if applicable)
        const totalInflictedBySave = this.getTotalInflictedDamage(
          damageDetails,
          saveDetail.damageDetails,
        );

        totalDamage += totalInflictedBySave;
        saveDetail.damage = totalInflictedBySave;
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
      detailsList: saveDetailsList,
    };
  }

  /**
   * Calculate the damage inflicted by damageList, adding the details to
   * listToUpdate and returning the total. Apply the optional modifier, along
   * with any resistance and vulnerability defined in the damage details, to
   * each damage in the list.
   * @param damageList a list of details for pre-rolled damage
   * @param listToUpdate a list to which the damage inflicted by each entry in
   * damageList will be appended
   * @param [modifier=1] a modifier to apply to each damage in damageList
   * before applying resistance or vulnerability
   * @returns the total amount of damage inflicted by the damages in damageList
   */
  getTotalInflictedDamage(
    damageList: DamageDetails[],
    listToUpdate: InflictedDamageDetails[],
    modifier = 1,
  ): number {
    let totalInflicted = 0;
    for (const dmg of damageList) {
      const inflicted = dmg.getInflictedDamage(modifier);
      totalInflicted += inflicted;
      listToUpdate.push({
        inflicted: inflicted,
        details: dmg,
      });
    }
    return totalInflicted;
  }
}
