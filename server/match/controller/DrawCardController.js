const DrawCardEvent = require('../../../shared/event/DrawCardEvent.js');

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

        playerStateService.drawCard({ byEvent: true });
        const requirementUpdater = playerRequirementUpdaterFactory.create(playerId, { type: 'drawCard' });
        requirementUpdater.progressRequirementByCount(1);
    }

    function onDrawCardBecauseOfDrawPhase({ playerId }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const cannotDrawMoreCards = !playerStateService.moreCardsCanBeDrawnForDrawPhase();
        if (cannotDrawMoreCards) {
            matchComService.emitToPlayer(playerId, 'drawCards', { moreCardsCanBeDrawn: false });
        }
        else {
            playerStateService.drawCard();
            const moreCardsCanBeDrawn = playerStateService.moreCardsCanBeDrawnForDrawPhase();
            matchComService.emitToPlayer(playerId, 'drawCards', { moreCardsCanBeDrawn });
        }
    }

    function onDiscardOpponentTopTwoCards(playerId) {
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        const drawCardRequirement = playerRequirementService.getFirstMatchingRequirement({ type: 'drawCard' });
        if (drawCardRequirement) {
            throw new Error('Cannot mill opponent with other requirements still in progress');
        }

        const playerStateService = playerStateServiceById[playerId];
        const cannotDrawMoreCards = !playerStateService.moreCardsCanBeDrawnForDrawPhase();
        if (cannotDrawMoreCards) {
            matchComService.emitToPlayer(playerId, 'drawCards', { moreCardsCanBeDrawn: false });
            return;
        }

        const turn = matchService.getTurn();
        playerStateService.storeEvent(new DrawCardEvent({ turn }));

        const moreCardsCanBeDrawn = playerStateService.moreCardsCanBeDrawnForDrawPhase();
        matchComService.emitToPlayer(playerId, 'drawCards', { moreCardsCanBeDrawn, cards: [] });

        const opponentStateService = playerStateServiceById[matchComService.getOpponentId(playerId)];
        opponentStateService.discardTopTwoCardsInDrawPile();

    }
}

module.exports = DrawCardController;