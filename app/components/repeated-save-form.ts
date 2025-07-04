import { A } from '@ember/array';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import type { EmptyObject } from '@glimmer/component/-private/component';
import { tracked } from '@glimmer/tracking';

import type RandomnessService from 'multiattack-5e/services/randomness';
import Damage from 'multiattack-5e/utils/damage';
import DiceStringParser from 'multiattack-5e/utils/dice-string-parser';
import type {
  RepeatedSaveResult,
  SaveDetails,
} from 'multiattack-5e/utils/repeated-save';
import RepeatedSave from 'multiattack-5e/utils/repeated-save';

import AdvantageState from './advantage-state-enum';
import DamageType from './damage-type-enum';

export default class RepeatedSaveFormComponent extends Component {
  @service('randomness') randomness: RandomnessService | undefined;

  @tracked numberOfSaves: number | null = 5;
  @tracked saveDC: number | null = 15;

  @tracked saveMod = '5 + 1d4';

  @tracked rollDamageEverySave = false;
  @tracked saveForHalfDamage = false;
  @tracked damageList: Damage[] = A([this.getDefaultDamage()]);

  @tracked advantageState = AdvantageState.STRAIGHT;

  @tracked totalDmg = 0;
  @tracked totalPasses = 0;
  @tracked saveDetailsList: SaveDetails[] = [];

  @tracked saveResultLog: RepeatedSaveResult[];

  diceGroupsRegex = DiceStringParser.diceStringRegexAsString;

  /**
   * Set up a save with default values and load the save result log if
   * available
   */
  constructor(owner: unknown, args: EmptyObject) {
    super(owner, args);
    // TODO: Try to retrieve a stored save log
    this.saveResultLog = [];
  }

  @action
  setAdvantageState(newState: AdvantageState) {
    assert(
      'advantage state handler must receive an advantage state',
      newState instanceof AdvantageState,
    );
    this.advantageState = newState;
  }

  @action
  setNumberOfSaves(event: Event) {
    assert(
      'number of saves setter must be called from input form',
      event.target instanceof HTMLInputElement,
    );
    const { value } = event.target!;
    if (value === '') {
      this.numberOfSaves = null;
    } else {
      this.numberOfSaves = Number(value);
    }
  }

  @action
  setSaveDC(event: Event) {
    assert(
      'save-DC setter must be called from input form',
      event.target instanceof HTMLInputElement,
    );
    const { value } = event.target!;
    if (value === '') {
      this.saveDC = null;
    } else {
      this.saveDC = Number(value);
    }
  }

  @action
  setSaveMod(event: Event) {
    assert(
      'save-mod setter must be called from input form',
      event.target instanceof HTMLInputElement,
    );
    this.saveMod = event.target!.value;
  }

  @action
  setNoDamageOnPassedSave() {
    this.saveForHalfDamage = false;
  }

  @action
  setHalfDamageOnPassedSave() {
    this.saveForHalfDamage = true;
  }

  @action
  setRollDamageEverySave(newRollDamageEverySave: InputEvent) {
    assert(
      'roll-damage-every-save handler must receive an event with a target that is an HTMLInputElement',
      newRollDamageEverySave.target instanceof HTMLInputElement,
    );
    this.rollDamageEverySave = newRollDamageEverySave.target.checked || false;
  }

  @action
  addNewDamageType() {
    this.damageList.pushObject(this.getDefaultDamage());
  }

  @action
  removeDamageType(index: number) {
    this.damageList.removeAt(index);
  }

  @action
  clearSaveLog() {
    // TODO: Clear the log from storage as well as in memory
    this.saveResultLog = [];
  }

  getDefaultDamage(): Damage {
    if (!this.randomness) {
      throw new Error(
        'Unable to access randomness service; service injection failed?',
      );
    }
    return new Damage('8d6', DamageType.FIRE.name, this.randomness);
  }

  /**
   * Customize the save detail log
   * @returns the desired header for the save detail log
   */
  getLogHeader = () => {
    return 'Save Log';
  };

  /**
   * Use the save's's number of passes to return either "N passes" or "1 pass"
   * as appropriate
   * @param repeatedSave data for a set of repeated saves, which includes the
   * total number of saves passed
   * @returns "1 pass" or "numberOfPasses passes" depending on whether
   * the total number of passes is equal to 1
   */
  getPassCountString = (repeatedSave: RepeatedSaveResult) => {
    if (repeatedSave.totalNumberOfPasses == 1) {
      return `${repeatedSave.totalNumberOfPasses} pass`;
    } else {
      return `${repeatedSave.totalNumberOfPasses} passes`;
    }
  };

  getSaveCountString = (repeatedSave: RepeatedSaveResult) => {
    return `Number of saves: ${repeatedSave.numberOfSaves}`;
  };

  getSaveDCString = (repeatedSave: RepeatedSaveResult) => {
    return `Save DC: ${repeatedSave.saveDC}`;
  };

  getSaveModifier = (repeatedSave: RepeatedSaveResult) => {
    return repeatedSave.modifier;
  };

  getSavingThrowString = (saveString: string) => {
    return `Saving throw: ${saveString}`;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getD20RollString = (ignored: SaveDetails) => {
    return 'to save';
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  shouldBoldDice = (ignored: SaveDetails) => {
    return false;
  };

  isPass = (save: SaveDetails) => {
    return save.pass;
  };

  getDamageModifications = (save: SaveDetails) => {
    // If this method is called at all, it is because damage was inflicted by
    // this save. Only save-for-half and save-for-no-damage are currently
    // supported, so if damage is inflicted on a pass it must be half damage.
    if (save.pass) {
      return ' (halved)';
    } else {
      return '';
    }
  };

  simulateRepeatedSaves = () => {
    if (!this.randomness) {
      throw new Error(
        'Unable to access randomness service; service injection failed?',
      );
    }

    if (this.numberOfSaves == null || this.saveDC == null) {
      throw new Error(
        `number of saves and save DC must both be set; received numberOfSaves=${this.numberOfSaves} and saveDC=${this.saveDC}`,
      );
    }

    const nextRepeatedSave = new RepeatedSave(
      this.numberOfSaves,
      this.saveDC,
      this.saveMod,
      this.advantageState,
      this.randomness,
      this.rollDamageEverySave,
      this.saveForHalfDamage,
      this.damageList,
    );

    // Create a new array so that the page will re-render
    this.saveResultLog = [
      nextRepeatedSave.simulateRepeatedSaves(),
      ...this.saveResultLog,
    ];

    // TODO: Attempt to store the updated save log

    // Return false to prevent this function from refreshing the page. Without
    // this, the tests which use form submission enter an infinite loop.
    return false;
  };
}
