module.exports = superclass => class extends superclass {
    get preventsOpponentMissilesFromAttacking() {
        return true;
    }
};