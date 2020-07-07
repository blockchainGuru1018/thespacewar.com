const FatalError = require("../../../shared/card/FatalError.js");

function DrawCardController(deps) {
    const {
        matchComService,
        playerServiceProvider,
        playerRequirementUpdaterFactory,
        playerServiceFactory,
    } = deps;

    return {
        onDrawCard,
        skipDrawCard,
        onDiscardOpponentTopTwoCards,
    };

    function onDrawCard(playerId) {
        const playerRuleService = playerServiceFactory.playerRuleService(
            playerId
        );
        if (!playerRuleService.canDrawCards()) {
            return;
            //TODO When playing I would accidentally press "Draw card" twice quickly, resulting in skipping 2 phases at once.
            // The problem arises from the latency of the response to my first press. It would then be odd to throw an error
            // here in such a case, as it would only amass to a lot of useless log entries on the server.
            // Currently there are other places which should have similar failure-states that _does_ throw an error.
            // What does the future maintainer or future me have to think about this issue?
        }

        const playerRequirementService = playerServiceProvider.getRequirementServiceById(
            playerId
        );
        const drawCardRequirement = playerRequirementService.getFirstMatchingRequirement(
            { type: "drawCard" }
        );
        if (drawCardRequirement) {
            onDrawCardForRequirement({ playerId });
        } else {
            const playerStateService = playerServiceProvider.getStateServiceById(
                playerId
            );
            const playerRuleService = playerServiceFactory.playerRuleService(
                playerId
            );
            const canDrawMoreCards =
                playerRuleService.moreCardsCanBeDrawnForDrawPhase() &&
                !playerStateService.deckIsEmpty();
            if (canDrawMoreCards) {
                onDrawCardBecauseOfDrawPhase({ playerId });
            } else {
                matchComService.emitToPlayer(playerId, "drawCards", {
                    moreCardsCanBeDrawn: false,
                });
            }
        }
    }

    function skipDrawCard(playerId) {
        const playerRuleService = playerServiceFactory.playerRuleService(
            playerId
        );
        if (!playerRuleService.canDrawCards()) {
            return;
        }

        const playerRequirementService = playerServiceProvider.getRequirementServiceById(
            playerId
        );
        const drawCardRequirement = playerRequirementService.getFirstMatchingRequirement(
            { type: "drawCard" }
        );
        const hasRequirement = !!drawCardRequirement;
        const cardIsFatalError =
            drawCardRequirement.cardCommonId === FatalError.CommonId;
        if (hasRequirement && cardIsFatalError) {
            completeDrawCardRequirement({ playerId });
        }
    }

    function onDiscardOpponentTopTwoCards(playerId) {
        const miller = playerServiceFactory.miller(playerId);
        if (!miller.canMill()) {
            matchComService.emitToPlayer(playerId, "drawCards", {
                moreCardsCanBeDrawn: false,
            });
            return;
        }

        const playerRequirementService = playerServiceFactory.playerRequirementService(
            playerId
        );
        const drawCardRequirement = playerRequirementService.getFirstMatchingRequirement(
            { type: "drawCard" }
        );
        if (drawCardRequirement) {
            miller.mill({ byEvent: true });

            const requirementUpdater = playerRequirementUpdaterFactory.create(
                playerId,
                { type: "drawCard" }
            );
            requirementUpdater.progressRequirementByCount(1);
        } else {
            miller.mill();

            const playerRuleService = playerServiceFactory.playerRuleService(
                playerId
            );
            matchComService.emitToPlayer(playerId, "drawCards", {
                moreCardsCanBeDrawn: playerRuleService.moreCardsCanBeDrawnForDrawPhase(),
            });
        }
    }

    function onDrawCardForRequirement({ playerId }) {
        const playerStateService = playerServiceProvider.getStateServiceById(
            playerId
        );

        playerStateService.drawCard({ byEvent: true });
        const requirementUpdater = playerRequirementUpdaterFactory.create(
            playerId,
            { type: "drawCard" }
        );
        requirementUpdater.progressRequirementByCount(1);
    }

    function onDrawCardBecauseOfDrawPhase({ playerId }) {
        const playerStateService = playerServiceProvider.getStateServiceById(
            playerId
        );
        playerStateService.drawCard();

        const playerRuleService = playerServiceFactory.playerRuleService(
            playerId
        );
        const moreCardsCanBeDrawn = playerRuleService.moreCardsCanBeDrawnForDrawPhase();
        matchComService.emitToPlayer(playerId, "drawCards", {
            moreCardsCanBeDrawn,
        });
    }

    function completeDrawCardRequirement({ playerId }) {
        const requirementUpdater = playerRequirementUpdaterFactory.create(
            playerId,
            { type: "drawCard" }
        );
        requirementUpdater.completeRequirement();
    }
}

module.exports = DrawCardController;
