const PlayerServiceProvider = require('../../match/PlayerServiceProvider.js');
const ServerCardFactory = require('../../../server/card/ServerCardFactory.js');
const PlayerStateService = require('../../match/PlayerStateService.js');
const MatchService = require('../../match/MatchService.js');

const playerStateServiceFactory = {
    fromIdAndState,
    withStubs: (stubs = {}) => {
        return {
            getAttackBoostForCard: () => 0,
            cardCanMoveOnTurnWhenPutDown: () => false,
            hasMatchingCardInSameZone: () => false,
            getCardsInDeck: () => [],
            getDiscardedCards: () => [],
            putDownEventCardInZone() {},
            putDownCardInZone() {},
            removeCardFromDeck() {},
            ...stubs
        };
    }
};

function fromIdAndState(playerId, state) {
    const matchService = new MatchService();
    matchService.setState(state);
    const playerServiceProvider = PlayerServiceProvider();
    const cardFactory = new ServerCardFactory({ matchService, playerServiceProvider, getFreshState: () => state });
    const playerStateService = new PlayerStateService({ playerId, matchService, cardFactory });
    playerServiceProvider.registerService(PlayerServiceProvider.TYPE.state, playerId, playerServiceProvider);
    return playerStateService;
}

module.exports = playerStateServiceFactory;
