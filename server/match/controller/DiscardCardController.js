const CheatError = require('../CheatError.js');

function DiscardCardController(deps) {

    const {
        matchComService,
        playerServiceProvider,
        playerRequirementUpdaterFactory
    } = deps;

    return {
        onDiscardCard
    }

    function onDiscardCard(playerId, cardId) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const discardedCard = playerStateService.findCardFromHand(cardId);
        if (!discardedCard) throw new CheatError('Invalid state - someone is cheating');

        const playerPhase = playerStateService.getPhase();
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        const isRequiredDiscard = !!playerRequirementService.getFirstMatchingRequirement({ type: 'discardCard' });
        const isSacrificialDiscard = playerPhase === 'action' && !isRequiredDiscard;
        const discardAsPartOfDiscardPhase = playerPhase === 'discard';

        playerStateService.removeCardFromHand(cardId);
        playerStateService.discardCard(discardedCard, { isSacrifice: isSacrificialDiscard });

        if (isRequiredDiscard) {
            onRequiredDiscard(playerId);
        }
        else if (isSacrificialDiscard) {
            onSacrificialDiscard(playerId);
        }
        else if (!discardAsPartOfDiscardPhase) {
            throw new CheatError('Illegal discard');
        }
    }

    function onSacrificialDiscard(playerId) {
        const opponentId = matchComService.getOpponentId(playerId);
        const opponentStateService = playerServiceProvider.getStateServiceById([opponentId]);
        const opponentDeck = opponentStateService.getDeck();
        const bonusCard = opponentDeck.drawSingle();
        opponentStateService.addCardToHand(bonusCard);
    }

    function onRequiredDiscard(playerId) {
        const requirementUpdater = playerRequirementUpdaterFactory.create(playerId, { type: 'discardCard' });
        requirementUpdater.progressRequirementByCount(1);
    }
}

module.exports = DiscardCardController;