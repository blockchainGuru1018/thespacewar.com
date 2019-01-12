const CheatError = require('./CheatError.js');
const itemNamesForOpponentByItemNameForPlayer = require('./itemNamesForOpponentByItemNameForPlayer.js');
const ExcellentWorkCommonId = '14';
const GrandOpportunityCommonId = '20';
const SupernovaCommonId = '15';
const DiscoveryCommonId = '42';
const FatalErrorCommonId = '38';
const ImplementedEventCards = [
    ExcellentWorkCommonId,
    GrandOpportunityCommonId,
    SupernovaCommonId,
    DiscoveryCommonId,
    FatalErrorCommonId
];

function PutDownCardController(deps) {

    const {
        matchService,
        matchComService,
        cardFactory,
        playerServiceProvider
    } = deps;

    return {
        onPutDownCard
    }

    function onPutDownCard(playerId, { location, cardId, choice }) {
        let currentPlayer = matchService.getCurrentPlayer();
        if (playerId !== currentPlayer) {
            throw new CheatError('Cannot put down card when it is not your turn');
        }

        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        let cardData = playerStateService.findCardFromAnySource(cardId);
        if (!cardData) throw new CheatError(`Cannot find card`);

        checkIfCanPutDownCard({ playerId, location, cardData })

        removeCardFromCurrentLocation({ playerId, location, cardData });

        putDownCardAtNewLocation({ playerId, location, cardData, choice });
    }

    function checkIfCanPutDownCard({ playerId, location, cardData }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        if (location === 'zone') {
            const canOnlyHaveOneOfCardInZone = cardFactory
                .createCardForPlayer(cardData, playerId)
                .canOnlyHaveOneInHomeZone();
            if (canOnlyHaveOneOfCardInZone && playerStateService.hasCardOfTypeInZone(cardData.commonId)) {
                throw new CheatError('Cannot put down card');
            }

            const playerActionPoints = playerStateService.getActionPointsForPlayer();
            const canAffordCard = playerActionPoints >= cardData.cost;
            if (!canAffordCard) {
                throw new CheatError('Cannot afford card');
            }
        } else if (location.startsWith('station')) {
            const hasAlreadyPutDownStationCard = playerStateService.hasAlreadyPutDownStationCardThisTurn();
            if (hasAlreadyPutDownStationCard) {
                throw new CheatError('Cannot put down more than one station card on the same turn');
            }
        }
    }

    function removeCardFromCurrentLocation({ playerId, location, cardData }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const cardId = cardData.id;
        if (playerStateService.hasCardOnHand(cardId)) {
            removeCardFromPlayerHand(playerId, cardId);
        } else if (playerStateService.hasCardInStationCards(cardId)) {
            if (location !== 'zone') {
                throw new CheatError('Cannot put down card');
            }

            removeStationCardFromPlayer(playerId, cardId);
        }
    }

    function putDownCardAtNewLocation({ playerId, location, cardData, choice }) {
        if (location === 'zone' && cardData.type === 'event') {
            putDownEventCardInZone({ playerId, cardData, choice })
        } else if (location === 'zone') {
            putDownCardInZone({ playerId, cardData });
        } else if (location.startsWith('station')) {
            putDownStationCard({ playerId, cardData, location });
        }
    }

    function putDownStationCard({ playerId, cardData, location }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const stationCard = playerStateService.addStationCard(cardData, location);
        matchComService.emitToOpponentOf(playerId,
            'putDownOpponentStationCard',
            matchComService.prepareStationCardForClient(stationCard));
    }

    function removeCardFromPlayerHand(playerId, cardId) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const cardsOnHand = playerStateService.getCardsOnHand();
        const cardIndexOnHand = cardsOnHand.findIndex(c => c.id === cardId);
        const cardData = cardsOnHand[cardIndexOnHand];
        if (!cardData) throw new CheatError('Card is not on hand');

        playerStateService.removeCardFromHand(cardId);
        return cardData;
    }

    function removeStationCardFromPlayer(playerId, cardId) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const stationCard = playerStateService.findStationCard(cardId);
        if (!stationCard.flipped) throw new CheatError('Cannot move station card that is not flipped to zone');

        playerStateService.removeStationCard(cardId);
        return stationCard;
    }

    function putDownEventCardInZone({ playerId, cardData, choice }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const card = cardFactory.createCardForPlayer(cardData, playerId);

        if (ImplementedEventCards.includes(cardData.commonId)) {
            if (cardData.commonId === SupernovaCommonId) {
                applySupernova({ playerId, cardData });
            } else if (cardData.commonId === ExcellentWorkCommonId) {
                applyExcellentWork({ playerId, cardData });
            } else if (cardData.commonId === GrandOpportunityCommonId) {
                applyGrandOpportunity({ playerId, cardData });
            } else if (cardData.commonId === DiscoveryCommonId) {
                applyDiscovery({ playerId, cardData, choice });
            } else if (card.commonId === FatalErrorCommonId) {
                applyFatalError({ playerId, cardData, choice });
            }

            if (!!card.requirementsWhenPutDownInHomeZone) {
                addRequirementsByCard({ playerId, card });
            }

            emitGenerousStateChangedEventToPlayer(playerId);
            emitGenerousStateChangedEventToPlayer(matchComService.getOpponentId(playerId));
        } else {
            playerStateService.putDownEventCardInZone(cardData);
            matchComService.emitToOpponentOf(playerId, 'opponentDiscardedCard', {
                discardedCard: cardData,
                opponentCardCount: playerStateService.getCardsOnHandCount()
            });
        }
    }

    function addRequirementsByCard({ playerId, card }) {
        const requirements = card.requirementsWhenPutDownInHomeZone;

        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        for (const requirement of requirements.forPlayer) {
            playerRequirementService.addCardRequirement(requirement);
        }

        const opponentId = matchComService.getOpponentId(playerId);
        const opponentRequirementService = playerServiceProvider.getRequirementServiceById(opponentId);
        for (const requirement of requirements.forOpponent) {
            opponentRequirementService.addCardRequirement(requirement);
        }
    }

    function applySupernova({ playerId, cardData }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const opponentId = matchComService.getOpponentId(playerId);
        const opponentStateService = playerServiceProvider.getStateServiceById(opponentId);

        const opponentCardsInZones = [
            ...opponentStateService.getCardsInZone(),
            ...opponentStateService.getCardsInOpponentZone()
        ];
        for (const opponentCard of opponentCardsInZones) {
            opponentStateService.removeCard(opponentCard.id);
            opponentStateService.discardCard(opponentCard);
        }

        const playerCardsInZones = [
            ...playerStateService.getCardsInZone(),
            ...playerStateService.getCardsInOpponentZone()
        ];
        for (const playerCard of playerCardsInZones) {
            playerStateService.removeCard(playerCard.id);
            playerStateService.discardCard(playerCard);
        }

        playerStateService.putDownEventCardInZone(cardData);

        addPlayerRequirementsFromSupernova(playerId);
        addPlayerRequirementsFromSupernova(opponentId);
    }

    function applyExcellentWork({ playerId, cardData }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);

        playerStateService.putDownEventCardInZone(cardData);
        playerRequirementService.addDrawCardRequirement({ count: 3, cardCommonId: cardData.commonId });
    }

    function applyGrandOpportunity({ playerId, cardData }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);

        playerStateService.putDownEventCardInZone(cardData);
        playerRequirementService.addDrawCardRequirement({ count: 6, cardCommonId: cardData.commonId });
        playerRequirementService.addDiscardCardRequirement({ count: 2, cardCommonId: cardData.commonId });
    }

    function applyDiscovery({ playerId, cardData, choice }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        const opponentId = matchComService.getOpponentId(playerId);
        const opponentRequirementService = playerServiceProvider.getRequirementServiceById(opponentId);

        playerStateService.putDownEventCardInZone(cardData);

        if (choice === 'draw') {
            playerRequirementService.addDrawCardRequirement({
                count: 4,
                common: true,
                cardCommonId: cardData.commonId
            });
            opponentRequirementService.addDrawCardRequirement({
                count: 4,
                common: true,
                cardCommonId: cardData.commonId
            });
        } else if (choice === 'discard') {
            playerRequirementService.addDiscardCardRequirement({
                count: 2,
                common: true,
                cardCommonId: cardData.commonId
            })
            opponentRequirementService.addDiscardCardRequirement({
                count: 2,
                common: true,
                cardCommonId: cardData.commonId
            })
        }
    }

    function applyFatalError({ playerId, cardData, choice: targetCardId }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        playerStateService.putDownEventCardInZone(cardData);

        const opponentId = matchComService.getOpponentId(playerId);
        const opponentStateService = playerServiceProvider.getStateServiceById(opponentId);

        if (opponentStateService.hasCard(targetCardId)) {
            opponentStateService.removeAndDiscardCardFromStationOrZone(targetCardId);
        } else if (playerStateService.hasCard(targetCardId)) {
            playerStateService.removeAndDiscardCardFromStationOrZone(targetCardId);
        }
    }

    function addPlayerRequirementsFromSupernova(playerId) {
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        playerRequirementService.addDiscardCardRequirement({ count: 3, common: true, cardCommonId: SupernovaCommonId });
        playerRequirementService.addDamageOwnStationCardRequirement({
            count: 3,
            common: true,
            cardCommonId: SupernovaCommonId
        });
    }

    function putDownCardInZone({ playerId, cardData }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        playerStateService.putDownCardInZone(cardData);
        matchComService.emitToOpponentOf(playerId, 'putDownOpponentCard', { location: 'zone', card: cardData });
    }

    function emitGenerousStateChangedEventToPlayer(playerId) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);

        const opponentId = matchComService.getOpponentId(playerId);
        const opponentStateService = playerServiceProvider.getStateServiceById(opponentId);
        matchComService.emitToPlayer(playerId, 'stateChanged', {
            discardedCards: playerStateService.getDiscardedCards(),
            cardsInZone: playerStateService.getCardsInZone(),
            cardsInOpponentZone: playerStateService.getCardsInOpponentZone(),
            stationCards: playerStateService.getStationCards(),
            cardsOnHand: playerStateService.getCardsOnHand(),
            events: playerStateService.getEvents(),
            requirements: playerRequirementService.getRequirements(),
            opponentCardCount: opponentStateService.getCardsOnHand().length,
            [itemNamesForOpponentByItemNameForPlayer.discardedCards]: opponentStateService.getDiscardedCards(),
            [itemNamesForOpponentByItemNameForPlayer.stationCards]: matchComService.prepareStationCardsForClient(
                opponentStateService.getStationCards()),
            [itemNamesForOpponentByItemNameForPlayer.cardsInOpponentZone]: opponentStateService.getCardsInOpponentZone(),
            [itemNamesForOpponentByItemNameForPlayer.cardsInZone]: opponentStateService.getCardsInZone()
        });
    }
}

module.exports = PutDownCardController;