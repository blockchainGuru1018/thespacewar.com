const CheatError = require('./CheatError.js');

function DiscardCardController(deps) {

    const {
        matchComService,
        playerStateServiceById,
        playerServiceProvider
    } = deps;

    return {
        onDiscardCard
    }

    function onDiscardCard(playerId, cardId) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const discardedCard = playerStateService.findCardFromHand(cardId);
        if (!discardedCard) throw new CheatError('Invalid state - someone is cheating');

        playerStateService.removeCardFromHand(cardId);
        playerStateService.discardCard(discardedCard);

        const playerPhase = playerStateService.getPhase();
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        const isRequiredDiscard = !!playerRequirementService.getLatestMatchingRequirement({ type: 'discardCard' });
        const isVoluntaryDiscard = playerPhase === 'action' && !isRequiredDiscard;
        const discardAsPartOfDiscardPhase = playerPhase === 'discard';

        if (isRequiredDiscard) {
            onRequiredDiscard({ playerId, discardedCard });
        }
        else if (isVoluntaryDiscard) {
            onVoluntaryDiscard({ playerId, discardedCard });
        }
        else if (discardAsPartOfDiscardPhase) {
            emitOpponentDiscardedCardToOpponentOf({ playerId, discardedCard });
        }
        else {
            throw new CheatError('Illegal discard');
        }
    }

    function onVoluntaryDiscard({ playerId, discardedCard }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const playerCardCount = playerStateService.getCardsOnHand().length;
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
        const discardCardRequirement = playerRequirementService.getLatestMatchingRequirement({ type: 'discardCard' });

        if (discardCardRequirement.count > 1) {
            const newCount = discardCardRequirement.count - 1;
            playerRequirementService.mergeLatestMatchingRequirement({ type: 'discardCard' }, { count: newCount });
        }
        else if (discardCardRequirement.common) {
            const opponentWaitingCommonRequirement = opponentRequirementService.getLatestMatchingRequirement({
                type: 'discardCard',
                common: true,
                waiting: true
            });
            if (opponentWaitingCommonRequirement) {
                playerRequirementService.removeLatestMatchingRequirement({ type: 'discardCard', common: true });
                opponentRequirementService.removeLatestMatchingRequirement({
                    type: 'discardCard',
                    common: true,
                    waiting: true
                })
            }
            else {
                playerRequirementService.mergeLatestMatchingRequirement({ type: 'discardCard', common: true }, {
                    count: 0,
                    waiting: true
                });
            }
        }
        else {
            playerRequirementService.removeLatestMatchingRequirement({ type: 'discardCard' });
        }

        matchComService.emitToPlayer(playerId, 'stateChanged', { requirements: playerRequirementService.getRequirements() });
        matchComService.emitToOpponentOf(playerId, 'stateChanged', { requirements: opponentRequirementService.getRequirements() });

        emitOpponentDiscardedCardToOpponentOf({ playerId, discardedCard });
    }

    function emitOpponentDiscardedCardToOpponentOf({ playerId, discardedCard }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const opponentCardCount = playerStateService.getCardsOnHand().length;
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