const CheatError = require('../CheatError.js');

const opponentSourceToPlayerSource = {
    opponentDrawStationCards: 'drawStationCards',
    opponentActionStationCards: 'actionStationCards',
    opponentHandSizeStationCards: 'handSizeStationCards',
    opponentHand: 'hand'
};

module.exports = function ({
    playerRequirementUpdaterFactory,
    playerServiceProvider,
    matchService,
    playerServiceFactory
}) {

    return {
        onSelectCard
    };

    function onSelectCard(playerId, { cardGroups }) {
        const selectedCardsCount = getSelectedCardsCount(cardGroups);
        validateIfCanProgressRequirementByCount(selectedCardsCount, playerId);

        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        const requirement = playerRequirementService.getFirstMatchingRequirement({ type: 'findCard' });

        if (requirement.target === 'homeZone') {
            moveCardsToHomeZone(cardGroups, playerId);
        }
        else if (requirement.target === 'hand') {
            moveCardsToHand(cardGroups, playerId);
        }
        else if (requirement.target === 'opponentDiscardPile') {
            moveCardsToOpponentDiscardPile(cardGroups, playerId);
        }

        progressRequirementByCount(selectedCardsCount, playerId);
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

        const cardCommonIds = [];
        for (const group of cardGroups) {
            for (const cardId of group.cardIds) {
                const cardData = removeCardFromSource(cardId, group.source, playerId);
                cardCommonIds.push(cardData.commonId);
                playerStateService.putDownCardInZone(cardData, { grantedForFreeByEvent: true });
            }
        }

        const opponentId = matchService.getOpponentId(playerId);
        const opponentActionLog = playerServiceFactory.actionLog(opponentId);
        opponentActionLog.opponentPlayedCards({ cardCommonIds })
    }

    function moveCardsToHand(cardGroups, playerId) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        for (const group of cardGroups) {
            for (const cardId of group.cardIds) {
                const cardData = removeCardFromSource(cardId, group.source, playerId);
                playerStateService.addCardToHand(cardData);
            }
        }
    }

    function moveCardsToOpponentDiscardPile(cardGroups, playerId) {
        const opponentId = matchService.getOpponentId(playerId);
        const opponentStateService = playerServiceProvider.getStateServiceById(opponentId);

        const cardCommonIds = [];
        for (const group of cardGroups) {
            for (const cardId of group.cardIds) {
                const playerSource = opponentSourceToPlayerSource[group.source];
                const cardData = removeCardFromSource(cardId, playerSource, opponentId);
                cardCommonIds.push(cardData.commonId);
                opponentStateService.discardCard(cardData);
            }
        }

        const opponentActionLog = playerServiceFactory.actionLog(opponentId);
        opponentActionLog.cardsDiscarded({ cardCommonIds });
    }

    function removeCardFromSource(cardId, source, playerId) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        if (source === 'deck') {
            return playerStateService.removeCardFromDeck(cardId);
        }
        else if (source === 'discardPile') {
            return playerStateService.removeCardFromDiscardPile(cardId);
        }
        else if (source === 'hand') {
            return playerStateService.removeCardFromHand(cardId);
        }
        else if (sourceIsStationCard(source)) {
            const stationCard = playerStateService.removeStationCard(cardId);
            return stationCard.card;
        }
    }

    function sourceIsStationCard(source) {
        return source === 'drawStationCards'
            || source === 'actionStationCards'
            || source === 'handSizeStationCards'
    }

    function getSelectedCardsCount(cardGroups) {
        return cardGroups.reduce((total, group) => total + group.cardIds.length, 0);
    }
};
