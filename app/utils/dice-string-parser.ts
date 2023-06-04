import DiceGroup from "./dice-group"

export interface DiceGroupsAndNumber {
    diceGroups: Array<DiceGroup>
    modifier: number
}

export default class DiceStringParser {
    // Matches a string containing only one or more instances of dice groups (eg 2d6) or numbers added or subtracted from each other. The string cannot contain any other entries. Every entry must be preceded by "+" or "-" except for the first term, where the sign is optional. Note that this regex cannot be marked with "g" or it will preserve state between different strings and incorrectly mark some as not matching.
    diceStringRegex = /^(?: *[+-]? *(?:\d+d\d+)|\d+)(?: *[+-] *(?:(?:\d+d\d+)|\d+))*$/i;

    // Matches a dice group or number with an optional sign. This uses "g" to enable parsing many terms out of the same expression; the code makes sure to consume all possible matches each time it is used.
    termRegex = /(?: *(?<sign>[+-]?) *(?:(?:(?<numDice>\d+)d(?<numSides>\d+))|(?<number>\d+)))/gi;

    /**
     * Parses a combination of dice groups and numbers, such as the string used to describe damage in D&D 5e, into a series of dice-group classes and the total modifier described by these numbers.
     * @param diceString a string describing one or more dice groups (eg 2d6) or numbers which are added to or subtracted from each other
     * @returns the list of described dice groups and all of the numbers added together into a single modifier
     */
    parse(diceString: string): DiceGroupsAndNumber {
        // Check that the string matches the overall expected pattern, with no additional text or missing signs
        if (!this.diceStringRegex.test(diceString)) {
            throw new Error("Unable to parse dice groups or constants from input string");
        }

        // Extract the dice groups and/or constant modifier one term at a time
        let described: DiceGroupsAndNumber = {
            diceGroups: [],
            modifier: 0
        };
        let match = this.termRegex.exec(diceString);
        while (match) {
            if (!match.groups) {
                throw new Error("Unexpectedly unable to find groups in match (regex constructed incorrectly?)");
            }

            // If the sign is unset, assume that the term should be added
            let add = !match.groups["sign"] || match.groups["sign"] == "+";

            if (match.groups["number"]) {
                let sign = add ? 1 : -1;
                described.modifier += sign * Number(match.groups["number"]);
            } else {
                described.diceGroups.push(
                    new DiceGroup(
                        Number(match.groups["numDice"]),
                        Number(match.groups["numSides"]),
                        add));
            }

            // Extract the next term from the string
            match = this.termRegex.exec(diceString);
        }
        return described;
    }
}