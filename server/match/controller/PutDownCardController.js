const CheatError = require('../CheatError.js');
const CardApplier = require('../card/CardApplier.js');

function PutDownCardController(deps) {

    const {
        matchService,
        matchComService,
        cardFactory,
        playerServiceProvider
    } = deps;

    const cardApplier = CardApplier({ playerServiceProvider, matchService });

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
        }
        else if (location.startsWith('station')) {
            const card = cardFactory.createCardForPlayer(cardData, playerId);
            if (!card.canBePutDownAsExtraStationCard && !playerStateService.canPutDownMoreStationCards()) {
                throw new CheatError('Cannot put down more station cards this turn');
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

    function putDownCardAtNewLocation({ playerId, location, cardData, choice }) {
        if (location.startsWith('station')) {
            putDownStationCard({ playerId, cardData, location });
        }
        else {
            if (location === 'zone' && cardData.type === 'event') {
                cardApplier.putDownEventCard(playerId, cardData, { choice });
            }
            else if (location === 'zone') {
                putDownCardInZone({ playerId, cardData });
            }

            const card = cardFactory.createCardForPlayer(cardData, playerId);
            if (!!card.requirementsWhenPutDownInHomeZone) {
                addCardRequirementsOnPutDownInHomeZone({ playerId, card });
            }
        }
    }

    function putDownStationCard({ playerId, cardData, location }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const stationCard = playerStateService.addStationCard(cardData, location);

        const currentTurn = matchService.getTurn();
        const durationCardsThatPermitExtraStationCards = playerStateService
            .getDurationCards()
            .map(c => cardFactory.createCardForPlayer(c, playerId))
            .filter(c => !!c.allowsToPutDownExtraStationCards
                && !!c.requirementsOnPutDownExtraStationCard
                && !playerStateService.getEvents().some(e => {
                    return e.turn === currentTurn
                        && e.type === 'putDownExtraStationCard'
                        && e.effectCardId === c.id
                }));

        for (const durationCard of durationCardsThatPermitExtraStationCards) {
            playerStateService.storeEvent({
                type: 'putDownExtraStationCard',
                effectCardId: durationCard.id,
                turn: currentTurn
            });

            addCardRequirements({
                playerId,
                requirements: durationCard.requirementsOnPutDownExtraStationCard
            });
        }

        matchComService.emitToOpponentOf(
            playerId,
            'putDownOpponentStationCard',
            matchComService.prepareStationCardForClient(stationCard)
        ); //TODO Can this be removed?
    }

    function addCardRequirements({ playerId, requirements }) { //TODO Duplicated from another controller. Perhaps this could move in to some service
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

    function addCardRequirementsOnPutDownInHomeZone({ playerId, card }) {
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

    function putDownCardInZone({ playerId, cardData }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        playerStateService.putDownCardInZone(cardData);
        matchComService.emitToOpponentOf(playerId, 'putDownOpponentCard', { location: 'zone', card: cardData });
    }
}

module.exports = PutDownCardController;