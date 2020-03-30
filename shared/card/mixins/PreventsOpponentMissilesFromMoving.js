module.exports = superclass => class extends superclass {
    get preventsOpponentMissilesFromMoving() {
        return true;
    }
};
