const DrawCardEvent = require('../../shared/event/DrawCardEvent.js');
const CheatError = require('./CheatError.js');
const itemNamesForOpponentByItemNameForPlayer = require('./itemNamesForOpponentByItemNameForPlayer.js');

function DrawPhaseController(deps) {

    const {
        matchService,
        matchComService,
        playerStateServiceById
    } = deps;

    return {
        onDrawCard,
        onDiscardOpponentTopTwoCards
    }

    function onDrawCard(playerId) {
        const playerStateService = playerStateServiceById[playerId];
        const cannotDrawMoreCards = !playerStateService.moreCardsCanBeDrawn();
        if (cannotDrawMoreCards) {
            matchComService.emitToPlayer(playerId, 'drawCards', { moreCardsCanBeDrawn: false, cards: [] });
            return;
        }

        const deck = playerStateService.getDeck();
        const card = deck.drawSingle();

        const updatedPlayerState = playerStateService.update(state => {
            state.cardsOnHand.push(card);
        });
        const cardsOnHandCount = updatedPlayerState.cardsOnHand.length;
        matchComService.emitToOpponentOf(playerId, 'setOpponentCardCount', cardsOnHandCount);

        const turn = matchService.getTurn();
        playerStateService.storeEvent(new DrawCardEvent({ turn }));
        const moreCardsCanBeDrawn = playerStateService.moreCardsCanBeDrawn();

        matchComService.emitToPlayer(playerId, 'drawCards', { moreCardsCanBeDrawn, cards: [card] });
    }

    function onDiscardOpponentTopTwoCards(playerId) {
        const playerStateService = playerStateServiceById[playerId];
        const cannotDrawMoreCards = !playerStateService.moreCardsCanBeDrawn();
        if (cannotDrawMoreCards) {
            matchComService.emitToPlayer(playerId, 'drawCards', { moreCardsCanBeDrawn: false, cards: [] });
            return;
        }

        const turn = matchService.getTurn();
        playerStateService.storeEvent(new DrawCardEvent({ turn }));

        const moreCardsCanBeDrawn = playerStateService.moreCardsCanBeDrawn();
        matchComService.emitToPlayer(playerId, 'drawCards', { moreCardsCanBeDrawn, cards: [] });

        const opponentStateService = playerStateServiceById[matchComService.getOpponentId(playerId)];
        opponentStateService.discardTopTwoCardsInDrawPile();

        const opponentDiscardedCards = opponentStateService.getDiscardedCards();
        matchComService.emitToPlayer(playerId, 'stateChanged', {
            [itemNamesForOpponentByItemNameForPlayer['discardedCards']]: opponentDiscardedCards,
            events: playerStateService.getEvents()
        });
        matchComService.emitToOpponentOf(playerId, 'stateChanged', {
            discardedCards: opponentDiscardedCards,
            events: opponentStateService.getEvents()
        });
    }
}

module.exports = DrawPhaseController;