module.exports = superclass => class extends superclass {
    canMoveOnTurnWhenPutDown() {
        return true;
    }
};