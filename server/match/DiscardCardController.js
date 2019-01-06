const CheatError = require('./CheatError.js');

function DiscardCardController(deps) {

    const {
        matchComService,
        playerStateServiceById,
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
            onRequiredDiscard({ playerId, discardedCard });
        }
        else if (isSacrificialDiscard) {
            onSacrificialDiscard({ playerId, discardedCard });
        }
        else if (discardAsPartOfDiscardPhase) {
            emitOpponentDiscardedCardToOpponentOf({ playerId, discardedCard });
        }
        else {
            throw new CheatError('Illegal discard');
        }
    }

    function onSacrificialDiscard({ playerId, discardedCard }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const playerCardCount = playerStateService.getCardsOnHandCount();
        const opponentId = matchComService.getOpponentId(playerId);
        const opponentStateService = playerStateServiceById[opponentId];

        const opponentDeck = opponentStateService.getDeck();
        const bonusCard = opponentDeck.drawSingle();
        opponentStateService.addCardToHand(bonusCard);
        matchComService.emitToOpponentOf(playerId, 'opponentDiscardedCard', {
            bonusCard,
            discardedCard,
            opponentCardCount: playerCardCount
        });
        emitOpponentCardCountToPlayer(playerId);
    }

    function onRequiredDiscard({ playerId, discardedCard }) {
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        const opponentId = matchComService.getOpponentId(playerId);
        const opponentRequirementService = playerServiceProvider.getRequirementServiceById(opponentId);

        const requirementUpdater = playerRequirementUpdaterFactory.create(playerId, { type: 'discardCard' });
        requirementUpdater.progressRequirementByCount(1);

        matchComService.emitToPlayer(playerId, 'stateChanged', {
            requirements: playerRequirementService.getRequirements()
        });
        matchComService.emitToOpponentOf(playerId, 'stateChanged', {
            requirements: opponentRequirementService.getRequirements()
        });
        emitOpponentDiscardedCardToOpponentOf({ playerId, discardedCard });
    }

    function emitOpponentDiscardedCardToOpponentOf({ playerId, discardedCard }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const opponentCardCount = playerStateService.getCardsOnHandCount();
        matchComService.emitToOpponentOf(playerId, 'opponentDiscardedCard', { discardedCard, opponentCardCount });
    }

    function emitOpponentCardCountToPlayer(playerId) {
        const opponentId = matchComService.getOpponentId(playerId);
        const opponentStateService = playerStateServiceById[opponentId];
        const opponentCardsOnHandCount = opponentStateService.getCardsOnHand().length;
        matchComService.emitToPlayer(playerId, 'setOpponentCardCount', opponentCardsOnHandCount);
    }
}

module.exports = DiscardCardController;