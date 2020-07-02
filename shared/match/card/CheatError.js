class CheatError extends Error {

    constructor(reason) {
        super(reason);

        this.message = reason;
        this.type = 'CheatDetected';
    }
}

module.exports = CheatError;
