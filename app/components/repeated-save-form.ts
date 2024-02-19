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

  @tracked numberOfSaves = 5;
  @tracked saveDC = 15;

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
   * Set up an save with default values and load the save result log if
   * available
   */
  constructor(owner: unknown, args: EmptyObject) {
    super(owner, args);
    // TODO: Try to retrieve a stored save log
    this.saveResultLog = [];
  }

  /**
   * This function is used to stop the repeated-save-form handlebars from
   * refreshing the page whenever the form is submitted. Without this, the tests
   * which use form submission enter an infinite loop.
   * @returns false
   */
  @action
  suppressPageRefresh() {
    return false;
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

  simulateRepeatedSaves = () => {
    if (!this.randomness) {
      throw new Error(
        'Unable to access randomness service; service injection failed?',
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
  };
}
