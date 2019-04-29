const CheatError = require('../CheatError.js');
const CardApplier = require('../card/CardApplier.js');
const PlayerServiceProvider = require('../../../shared/match/PlayerServiceProvider.js');

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
    };

    function onPutDownCard(playerId, { location, cardId, choice }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        let cardData = playerStateService.findCardFromAnySource(cardId);
        if (!cardData) throw new CheatError(`Cannot find card`);

        checkIfCanPutDownCard({ playerId, location, cardData });

        removeCardFromCurrentLocation({ playerId, location, cardData });

        putDownCardAtNewLocation({ playerId, location, cardData, choice });
    }

    function checkIfCanPutDownCard({ playerId, location, cardData }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const canThePlayer = playerServiceProvider.getCanThePlayerServiceById(playerId);
        const ruleService = playerServiceProvider.byTypeAndId(PlayerServiceProvider.TYPE.rule, playerId);

        if (location === 'zone') {
            if (!ruleService.canPutDownCardsInHomeZone()) {
                throw new CheatError('Cannot put down card');
            }

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
            if (!ruleService.canPutDownStationCards()) {
                throw new CheatError('Cannot put down card');
            }

            const card = cardFactory.createCardForPlayer(cardData, playerId);
            if (!card.canBePutDownAsExtraStationCard && !canThePlayer.putDownMoreStationCards()) {
                throw new CheatError('Cannot put down more station cards this turn');
            }
        }
    }

    function removeCardFromCurrentLocation({ playerId, cardData }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const cardId = cardData.id;
        if (playerStateService.hasCardOnHand(cardId)) {
            removeCardFromPlayerHand(playerId, cardId);
        }
        else if (playerStateService.hasCardInStationCards(cardId)) {
            removeStationCardFromPlayer(playerId, cardId);
        }
    }

    function putDownCardAtNewLocation({ playerId, location, cardData, choice }) {
        if (location.startsWith('station')) {
            putDownStationCard({ playerId, cardData, location, choice });
        }
        else {
            if (location === 'zone' && cardData.type === 'event') {
                cardApplier.putDownEventCard(playerId, cardData, { choice });
            }
            else if (location === 'zone') {
                putDownCardInZone({ playerId, cardData });
            }

            const card = cardFactory.createCardForPlayer(cardData, playerId);
            if (card.requirementsWhenPutDownInHomeZone) {
                addCardRequirementsOnPutDownInHomeZone({ playerId, card });
            }
        }
    }

    function putDownStationCard({ playerId, cardData, location, choice }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const stationCard = playerStateService.addStationCard(cardData, location, { putDownAsExtraStationCard: choice === 'putDownAsExtraStationCard' });

        const currentTurn = matchService.getTurn();
        const durationCardsThatPermitExtraStationCards = playerStateService
            .getDurationCards()
            .map(c => cardFactory.createCardForPlayer(c, playerId))
            .filter(c => !!c.allowsToPutDownExtraStationCards //TODO Simplify this filter! Perhpas could replace getEvents().some... with some queryEvent class operation?
                && !!c.requirementsOnPutDownExtraStationCard
                && !playerStateService.getEvents().some(e => {
                    return e.turn === currentTurn
                        && e.type === 'putDownExtraStationCard'
                        && e.effectCardId === c.id
                }));

        for (const durationCard of durationCardsThatPermitExtraStationCards) {
            addEventToKeepCountOfExtraStationCards(durationCard.id, playerId);
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

    function addEventToKeepCountOfExtraStationCards(durationCardId, playerId) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        playerStateService.storeEvent({
            type: 'putDownExtraStationCard',
            effectCardId: durationCardId,
            turn: matchService.getTurn()
        });
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
