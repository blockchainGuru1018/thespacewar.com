const FreeExtraStationCardGrantedEvent = require('./FreeExtraStationCardGrantedEvent.js');

module.exports = function ({
    matchService
}) {

    return {
        fromSpec
    };

    function fromSpec(spec) {
        if (spec.type === 'freeExtraStationCardGranted') {
            const currentTurn = matchService.getTurn();
            return FreeExtraStationCardGrantedEvent({ turn: currentTurn, count: spec.count });
        }

        throw new Error('Not implemented event spec: ' + spec);
    }
};