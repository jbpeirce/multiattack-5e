import Die from 'multiattack-5e/utils/die';

export default class DiceGroup {
    numDice: number
    die: Die

    constructor(numDice: number, numSides: number) {
        if (numDice < 0) {
            throw new Error("Number of dice in group must be non-negative")
        }

        this.numDice = numDice
        this.die = new Die(numSides)
    }

    roll(): number {
        /**
         * Roll all of the dice in this group (which are identical to
         * each other) and return the total
         * 
         * @returns the total from rolling all of the dice in this group
         */
        let total = 0
        for (let i = 0; i < this.numDice; i++) {
            total += this.die.roll()
        }
        return total
    }
}