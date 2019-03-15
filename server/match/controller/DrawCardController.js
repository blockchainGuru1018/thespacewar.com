function DrawCardController(deps) {

    const {
        matchService,
        matchComService,
        playerServiceProvider,
        playerRequirementUpdaterFactory
    } = deps;

    return {
        onDrawCard,
        onDiscardOpponentTopTwoCards
    };

    function onDrawCard(playerId) {
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        const drawCardRequirement = playerRequirementService.getFirstMatchingRequirement({ type: 'drawCard' });

        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const cannotDrawMoreCards = !playerStateService.moreCardsCanBeDrawnForDrawPhase();
        if (drawCardRequirement) {
            onDrawCardForRequirement({ playerId });
        }
        else {
            if (cannotDrawMoreCards) {
                matchComService.emitToPlayer(playerId, 'drawCards', { moreCardsCanBeDrawn: false });
            }
            else {
                onDrawCardBecauseOfDrawPhase({ playerId });
            }
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
        playerStateService.drawCard();
        const moreCardsCanBeDrawn = playerStateService.moreCardsCanBeDrawnForDrawPhase();
        matchComService.emitToPlayer(playerId, 'drawCards', { moreCardsCanBeDrawn });
    }

    function onDiscardOpponentTopTwoCards(playerId) {
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        const drawCardRequirement = playerRequirementService.getFirstMatchingRequirement({ type: 'drawCard' });
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        if (!drawCardRequirement && !playerStateService.moreCardsCanBeDrawnForDrawPhase()) {
            matchComService.emitToPlayer(playerId, 'drawCards', { moreCardsCanBeDrawn: false });
            return;
        }

        const opponentStateService = playerServiceProvider.getStateServiceById([matchService.getOpponentId(playerId)]);
        opponentStateService.discardTopTwoCardsInDrawPile();
        playerStateService.registerMill();

        if (drawCardRequirement) {
            const requirementUpdater = playerRequirementUpdaterFactory.create(playerId, { type: 'drawCard' });
            requirementUpdater.progressRequirementByCount(1);
        }
        else {
            matchComService.emitToPlayer(playerId, 'drawCards', {
                moreCardsCanBeDrawn: playerStateService.moreCardsCanBeDrawnForDrawPhase()
            });
        }
    }
}

module.exports = DrawCardController;