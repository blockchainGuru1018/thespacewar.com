const CheatError = require('../CheatError.js');
const MatchMode = require("../../../shared/match/MatchMode.js");

function DiscardCardController(deps) {

    const {
        matchService,
        playerServiceProvider,
        playerServiceFactory,
        playerRequirementUpdaterFactory
    } = deps;

    return {
        onDiscardCard
    };

    function onDiscardCard(playerId, cardId) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const discardedCard = playerStateService.findCardFromHand(cardId);
        if (!discardedCard) throw new CheatError('Invalid state - someone is cheating');

        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        const isRequiredDiscard = !!playerRequirementService.getFirstMatchingRequirement({ type: 'discardCard' });
        const playerRuleService = playerServiceFactory.playerRuleService(playerId);
        if (!playerRuleService.canDiscardCards()) {
            throw new CheatError('Illegal discard');
        }

        playerStateService.removeCardFromHand(cardId);
        playerStateService.discardCard(discardedCard);

        if (isRequiredDiscard) {
            onRequiredDiscard(playerId);
        }
        else if (playerRuleService.canReplaceCards()) {
            playerRequirementService.addDrawCardRequirement({ count: 1 });

            const event = { type: 'replaceCard' };
            if (matchService.mode() === MatchMode.game) {
                event.turn = matchService.getTurn();
            }
            playerStateService.storeEvent(event);
        }
    }

    function onRequiredDiscard(playerId) {
        const requirementUpdater = playerRequirementUpdaterFactory.create(playerId, { type: 'discardCard' });
        requirementUpdater.progressRequirementByCount(1);
    }
}

module.exports = DiscardCardController;
