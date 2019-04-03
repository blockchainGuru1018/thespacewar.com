const CheatError = require('../CheatError.js');

function DiscardCardController(deps) {

    const {
        playerServiceProvider,
        playerRequirementUpdaterFactory
    } = deps;

    return {
        onDiscardCard
    };

    function onDiscardCard(playerId, cardId) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const discardedCard = playerStateService.findCardFromHand(cardId);
        if (!discardedCard) throw new CheatError('Invalid state - someone is cheating');

        const playerPhase = playerStateService.getPhase();
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        const isRequiredDiscard = !!playerRequirementService.getFirstMatchingRequirement({ type: 'discardCard' });
        const ordinaryDiscard = playerPhase === 'action' || playerPhase === 'discard';

        playerStateService.removeCardFromHand(cardId);
        playerStateService.discardCard(discardedCard);

        if (isRequiredDiscard) {
            onRequiredDiscard(playerId);
        }
        else if (!ordinaryDiscard) {
            throw new CheatError('Illegal discard');
        }
    }

    function onRequiredDiscard(playerId) {
        const requirementUpdater = playerRequirementUpdaterFactory.create(playerId, { type: 'discardCard' });
        requirementUpdater.progressRequirementByCount(1);
    }
}

module.exports = DiscardCardController;