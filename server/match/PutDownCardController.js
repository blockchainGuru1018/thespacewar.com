const CheatError = require('./CheatError.js');
const itemNamesForOpponentByItemNameForPlayer = require('./itemNamesForOpponentByItemNameForPlayer.js');
const EXCELLENT_WORK_COMMON_ID = '14';
const SUPERNOVA_COMMON_ID = '15';

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

    function onPutDownCard(playerId, { location, cardId }) {
        let currentPlayer = matchService.getCurrentPlayer();
        if (playerId !== currentPlayer) {
            throw new CheatError('Cannot put down card when it is not your turn');
        }

        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        let cardData = playerStateService.findCardFromAnySource(cardId);
        if (!cardData) throw new CheatError(`Cannot find card`);

        checkIfCanPutDownCard({ playerId, location, cardData })

        removeCardFromCurrentLocation({ playerId, location, cardData });

        putDownCardAtNewLocation({ playerId, location, cardData });
    }

    function checkIfCanPutDownCard({ playerId, location, cardData }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        if (location === 'zone') {
            const canOnlyHaveOneOfCardInZone = cardFactory
                .createCardForPlayer(cardData, playerId)
                .canOnlyHaveOneInHomeZone();
            if (canOnlyHaveOneOfCardInZone && playerStateService.hasCardOfSameTypeInZone(cardData.commonId)) {
                throw new CheatError('Cannot put down card');
            }

            const playerActionPoints = playerStateService.getActionPointsForPlayer();
            const canAffordCard = playerActionPoints >= cardData.cost;
            if (!canAffordCard) {
                throw new CheatError('Cannot afford card');
            }
        }
        else if (location.startsWith('station')) {
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
        }
        else if (playerStateService.hasCardInStationCards(cardId)) {
            if (location !== 'zone') {
                throw new CheatError('Cannot put down card');
            }

            removeStationCardFromPlayer(playerId, cardId);
        }
    }

    function putDownCardAtNewLocation({ playerId, location, cardData }) {
        if (location === 'zone' && cardData.type === 'event') {
            putDownEventCardInZone({ playerId, cardData })
        }
        else if (location === 'zone') {
            putDownCardInZone({ playerId, cardData });
        }
        else if (location.startsWith('station')) {
            putDownStationCard({ playerId, cardData, location });
        }
    }

    function putDownStationCard({ playerId, cardData, location }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const stationCard = playerStateService.addStationCard(cardData, location);
        matchComService.emitToOpponentOf(playerId, 'putDownOpponentStationCard', matchComService.prepareStationCardForClient(stationCard));
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

    function putDownEventCardInZone({ playerId, cardData }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);

        if (cardData.commonId === SUPERNOVA_COMMON_ID) {
            applySupernova({ playerId, cardData });
        }
        else if (cardData.commonId === EXCELLENT_WORK_COMMON_ID) {
            applyExcellentWork({ playerId, cardData });
        }
        else {
            playerStateService.putDownEventCardInZone(cardData);
            matchComService.emitToOpponentOf(playerId, 'opponentDiscardedCard', {
                discardedCard: cardData,
                opponentCardCount: playerStateService.getCardsOnHand().length
            });
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

        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        matchComService.emitToPlayer(playerId, 'stateChanged', {
            cardsInZone: playerStateService.getCardsInZone(),
            cardsInOpponentZone: playerStateService.getCardsInOpponentZone(),
            discardedCards: playerStateService.getDiscardedCards(),
            requirements: playerRequirementService.getRequirements(),
            events: playerStateService.getEvents(),
            [itemNamesForOpponentByItemNameForPlayer.cardsInZone]: opponentStateService.getCardsInZone(),
            [itemNamesForOpponentByItemNameForPlayer.cardsInOpponentZone]: opponentStateService.getCardsInOpponentZone(),
            [itemNamesForOpponentByItemNameForPlayer.discardedCards]: opponentStateService.getDiscardedCards()
        });
        const opponentRequirementService = playerServiceProvider.getRequirementServiceById(opponentId);
        matchComService.emitToOpponentOf(playerId, 'stateChanged', {
            cardsInZone: opponentStateService.getCardsInZone(),
            cardsInOpponentZone: opponentStateService.getCardsInOpponentZone(),
            discardedCards: opponentStateService.getDiscardedCards(),
            requirements: opponentRequirementService.getRequirements(),
            events: opponentStateService.getEvents(),
            opponentCardCount: playerStateService.getCardsOnHand().length,
            [itemNamesForOpponentByItemNameForPlayer.cardsInZone]: playerStateService.getCardsInZone(),
            [itemNamesForOpponentByItemNameForPlayer.cardsInOpponentZone]: playerStateService.getCardsInOpponentZone(),
            [itemNamesForOpponentByItemNameForPlayer.discardedCards]: playerStateService.getDiscardedCards()
        });
    }

    function applyExcellentWork({ playerId, cardData }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);

        playerStateService.putDownEventCardInZone(cardData);

        const playerDeck = playerStateService.getDeck();
        const drawCardCount = Math.min(3, playerDeck.getCardCount());
        playerRequirementService.addRequirement({ type: 'drawCard', count: drawCardCount });

        matchComService.emitToPlayer(playerId, 'stateChanged', {
            discardedCards: playerStateService.getDiscardedCards(),
            events: playerStateService.getEvents(),
            requirements: playerRequirementService.getRequirements()
        });
        matchComService.emitToOpponentOf(playerId, 'stateChanged', {
            [itemNamesForOpponentByItemNameForPlayer.discardedCards]: playerStateService.getDiscardedCards(),
            opponentCardCount: playerStateService.getCardsOnHand().length
        });
    }

    function addPlayerRequirementsFromSupernova(playerId) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);

        const cardsToDiscard = Math.min(3, playerStateService.getCardsOnHand().length);
        if (cardsToDiscard > 0) {
            playerRequirementService.addRequirement({
                type: 'discardCard',
                count: cardsToDiscard,
                common: true
            });
        }

        const stationCardsToDamage = Math.min(3, playerStateService.getUnflippedStationCardsCount());
        if (stationCardsToDamage > 0) {
            playerRequirementService.addRequirement({
                type: 'damageOwnStationCard',
                count: stationCardsToDamage,
                common: true
            });
        }
    }

    function putDownCardInZone({ playerId, cardData }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        playerStateService.putDownCardInZone(cardData);
        matchComService.emitToOpponentOf(playerId, 'putDownOpponentCard', { location: 'zone', card: cardData });
    }
}

module.exports = PutDownCardController;