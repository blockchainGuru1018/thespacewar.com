module.exports = (superclass) =>
    class AllowsFriendlySpaceShipsToMoveTurnWhenPutDown extends superclass {
        get allowsFriendlySpaceShipsToMoveTurnWhenPutDown() {
            return true;
        }
    };
