const MatchService = require('./MatchService.js');
const StateMemento = require('./StateMemento.js');
const CardDataAssembler = require('../CardDataAssembler.js');
const StateSerializer = require('../../server/match/StateSerializer.js');

module.exports = function ({ state, endMatch, rawCardDataRepository }) {

    const objectsByNameAndPlayerId = {};

    const api = {
        _cache: objectsByNameAndPlayerId,
        matchService: cached(matchService),
        stateMemento: cached(stateMemento),
        cardDataAssembler: cached(cardDataAssembler),
        stateSerializer: cached(stateSerializer)
    };

    return api;

    function cardDataAssembler() {
        return CardDataAssembler({ rawCardDataRepository });
    }

    function stateSerializer() {
        return StateSerializer({
            cardDataAssembler: api.cardDataAssembler()
        });
    }

    function stateMemento() {
        return StateMemento({
            matchService: api.matchService(),
            stateSerializer: api.stateSerializer()
        });
    }

    function matchService() {
        let matchService = new MatchService({ endMatch });
        matchService.setState(state);
        return matchService;
    }

    function cached(constructor) {
        const name = constructor.name;
        return (playerIdOrUndefined) => {
            const key = name + ':' + playerIdOrUndefined;
            const existingCopy = objectsByNameAndPlayerId[key];
            if (existingCopy) return existingCopy;

            const result = constructor(playerIdOrUndefined);
            objectsByNameAndPlayerId[key] = result;
            return result;
        };
    }
};
