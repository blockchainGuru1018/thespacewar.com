module.exports = (superclass) =>
    class extends superclass {
        get numberOfAttacksPerTurn() {
            return 2;
        }
    };
