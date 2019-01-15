const CheatError = require('../CheatError.js');

module.exports = function (deps) {

    const {
        matchComService,
        playerStateServiceById,
        cardFactory
    } = deps;

    return {
        onMoveCard
    };

    function onMoveCard(playerId, cardId) {
        let playerState = playerStateServiceById[playerId];
        const cardData = playerState.findCard(cardId);
        const card = cardFactory.createCardForPlayer(cardData, playerId);
        if (!card.canMove()) throw new CheatError('Cannot move card');

        playerState.moveCard(cardId);
        matchComService.emitToOpponentOf(playerId, 'opponentMovedCard', cardId)
    }
};