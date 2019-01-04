const DrawCardEvent = require('../../shared/event/DrawCardEvent.js');
const CheatError = require('./CheatError.js');
const itemNamesForOpponentByItemNameForPlayer = require('./itemNamesForOpponentByItemNameForPlayer.js');

function DrawCardController(deps) {

    const {
        matchService,
        matchComService,
        playerStateServiceById,
        playerServiceProvider,
        playerRequirementUpdaterFactory
    } = deps;

    return {
        onDrawCard,
        onDiscardOpponentTopTwoCards
    }

    function onDrawCard(playerId) {
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        const drawCardRequirement = playerRequirementService.getFirstMatchingRequirement({ type: 'drawCard' });
        if (drawCardRequirement) {
            onDrawCardForRequirement({ playerId });
        }
        else {
            onDrawCardBecauseOfDrawPhase({ playerId });
        }
    }

    function onDrawCardForRequirement({ playerId }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        const opponentId = matchComService.getOpponentId(playerId);
        const opponentRequirementService = playerServiceProvider.getRequirementServiceById(opponentId);

        playerStateService.drawCard({ byEvent: true });
        const requirementUpdater = playerRequirementUpdaterFactory.create(playerId, { type: 'drawCard' });
        requirementUpdater.progressRequirementByCount(1);

        matchComService.emitToPlayer(playerId, 'stateChanged', {
            events: playerStateService.getEvents(),
            cardsOnHand: playerStateService.getCardsOnHand(),
            requirements: playerRequirementService.getRequirements()
        });
        matchComService.emitToOpponentOf(playerId, 'stateChanged', {
            opponentCardCount: playerStateService.getCardsOnHand().length,
            requirements: opponentRequirementService.getRequirements()
        });
    }

    function onDrawCardBecauseOfDrawPhase({ playerId }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const cannotDrawMoreCards = !playerStateService.moreCardsCanBeDrawnForDrawPhase();
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
        playerStateService.storeEvent(DrawCardEvent({ turn }));
        const moreCardsCanBeDrawn = playerStateService.moreCardsCanBeDrawnForDrawPhase();

        matchComService.emitToPlayer(playerId, 'drawCards', { moreCardsCanBeDrawn, cards: [card] });
    }

    function onDiscardOpponentTopTwoCards(playerId) {
        const playerStateService = playerStateServiceById[playerId];
        const cannotDrawMoreCards = !playerStateService.moreCardsCanBeDrawnForDrawPhase();
        if (cannotDrawMoreCards) {
            matchComService.emitToPlayer(playerId, 'drawCards', { moreCardsCanBeDrawn: false, cards: [] });
            return;
        }

        const turn = matchService.getTurn();
        playerStateService.storeEvent(new DrawCardEvent({ turn }));

        const moreCardsCanBeDrawn = playerStateService.moreCardsCanBeDrawnForDrawPhase();
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

module.exports = DrawCardController;