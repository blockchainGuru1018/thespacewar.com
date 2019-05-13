const PlayerServiceProvider = require('../../match/PlayerServiceProvider.js');
const CardFactory = require('../../card/CardFactory.js');
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
    const cardFactory = new CardFactory({ matchService, playerServiceProvider });
    const playerStateService = new PlayerStateService({ playerId, matchService, cardFactory });
    playerServiceProvider.registerService(PlayerServiceProvider.TYPE.state, playerId, playerServiceProvider);
    return playerStateService;
}

module.exports = playerStateServiceFactory;
