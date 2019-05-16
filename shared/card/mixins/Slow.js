module.exports = superclass => class extends superclass {
    canMoveAndAttackOnSameTurn() {
        return false;
    }
};
