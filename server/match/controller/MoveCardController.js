const PlayerServiceProvider = require('../../../shared/match/PlayerServiceProvider.js');
const CheatError = require('../CheatError.js');

module.exports = function (deps) {

    const {
        matchService,
        matchComService,
        playerServiceProvider,
        playerServiceFactory,
        cardFactory
    } = deps;

    return {
        onMoveCard,
        moveStationCard
    };

    function onMoveCard(playerId, cardId) {
        let cannotMove = playerServiceProvider.byTypeAndId(PlayerServiceProvider.TYPE.canThePlayer, playerId).moveCards();
        if (!cannotMove) throw new CheatError('Cannot move');

        let playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const cardData = playerStateService.findCard(cardId);
        const card = cardFactory.createCardForPlayer(cardData, playerId);
        if (!card.canMove()) throw new CheatError('Cannot move card');

        playerStateService.moveCard(cardId);
        matchComService.emitToOpponentOf(playerId, 'opponentMovedCard', cardId); //TODO Remove and test IRL. Should work without. Also remove on the client in MatchStore.js!

        const opponentActionLog = playerServiceFactory.actionLog(matchService.getOpponentId(playerId));
        opponentActionLog.opponentMovedCard({ cardCommonId: cardData.commonId });
    }

    function moveStationCard(playerId, { cardId, location }) {
        const moveStationCard = playerServiceFactory.moveStationCard(playerId);
        if (!moveStationCard.canMove({ cardId, location })) throw new CheatError('Cannot move station card');
        moveStationCard.move({ cardId, location });
    }
};
