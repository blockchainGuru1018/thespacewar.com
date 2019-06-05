const MatchService = require('./MatchService.js');
const StateMemento = require('./StateMemento.js');
const CardDataAssembler = require('../CardDataAssembler.js');
const CardInfoRepository = require('../CardInfoRepository.js');
const StateSerializer = require('../../server/match/StateSerializer.js');

module.exports = function ({ state, endMatch, rawCardDataRepository, gameConfig }) {

    const objectsByNameAndPlayerId = {};

    const api = {
        _cache: objectsByNameAndPlayerId,
        matchService: cached(matchService),
        stateMemento: cached(stateMemento),
        cardDataAssembler: cached(cardDataAssembler),
        cardInfoRepository: cached(cardInfoRepository),
        stateSerializer: cached(stateSerializer)
    };

    return api;

    function cardDataAssembler() {
        return CardDataAssembler({ rawCardDataRepository });
    }

    function cardInfoRepository() {
        return CardInfoRepository({
            cardDataAssembler: api.cardDataAssembler()
        });
    }

    function stateSerializer() {
        return StateSerializer({
            cardDataAssembler: api.cardDataAssembler()
        });
    }

    function stateMemento() {
        return StateMemento({
            matchService: api.matchService(),
            stateSerializer: api.stateSerializer(),
            gameConfig
        });
    }

    function matchService() {
        let matchService = new MatchService({ gameConfig, endMatch });
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
