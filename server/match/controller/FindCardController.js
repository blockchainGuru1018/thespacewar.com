const CheatError = require('../CheatError.js');

module.exports = function ({
    playerRequirementUpdaterFactory,
    playerServiceProvider
}) {

    return {
        onSelectCard
    };

    function onSelectCard(playerId, { cardGroups }) {
        const selectedCardsCount = getSelectedCardsCount(cardGroups);
        validateIfCanProgressRequirementByCount(selectedCardsCount, playerId);

        progressRequirementByCount(selectedCardsCount, playerId);
        moveCardsToHomeZone(cardGroups, playerId);
    }

    function validateIfCanProgressRequirementByCount(count, playerId) {
        const playerRequirementUpdater = playerRequirementUpdaterFactory.create(playerId, { type: 'findCard' });
        let canProgressRequirement = playerRequirementUpdater.canProgressRequirementByCount(count);
        if (!canProgressRequirement) {
            throw new CheatError('Cannot select more cards than required');
        }
    }

    function progressRequirementByCount(count, playerId) {
        const playerRequirementUpdater = playerRequirementUpdaterFactory.create(playerId, { type: 'findCard' });
        playerRequirementUpdater.progressRequirementByCount(count);
    }

    function moveCardsToHomeZone(cardGroups, playerId) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        for (const group of cardGroups) {
            for (const cardId of group.cardIds) {
                const cardData = removeCardFromSource(cardId, group.source, playerId);
                playerStateService.putDownCardInZone(cardData, { grantedForFreeByEvent: true });
            }
        }
    }

    function removeCardFromSource(cardId, source, playerId) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        if (source === 'deck') {
            return playerStateService.removeCardFromDeck(cardId);
        }
        else if (source === 'discardPile') {
            return playerStateService.removeCardFromDiscardPile(cardId);
        }
    }

    function getSelectedCardsCount(cardGroups) {
        return cardGroups.reduce((total, group) => total + group.cardIds.length, 0);
    }
};