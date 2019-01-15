const CheatError = require('../CheatError.js');
const CardApplier = require('../card/CardApplier.js');
const itemNamesForOpponentByItemNameForPlayer = require('../itemNamesForOpponentByItemNameForPlayer.js');
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
        stateChangeListener,
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

    function putDownCardAtNewLocation({ playerId, location, cardData, choice }) {
        if (location === 'zone' && cardData.type === 'event') {
            putDownEventCardInZone({ playerId, cardData, choice })
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
        matchComService.emitToOpponentOf(
            playerId,
            'putDownOpponentStationCard',
            matchComService.prepareStationCardForClient(stationCard)
        );
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

    //TODO Try to remove state change emits all over the game
    //TODO Try to make sure every state change in playerstateservice is done through an "update" method
    //TODO Would be nice to do away with "opponentDiscardedCard" events and the likes of that
    //TODO Then test it a lot IRL! And Commit. And log time for the last 2 days in KF!
    //TODO Implement Neutralization.

    function putDownEventCardInZone({ playerId, cardData, choice = '' }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const card = cardFactory.createCardForPlayer(cardData, playerId);

        cardApplier.putDownEventCard(playerId, cardData, { choice });
        if (!!card.requirementsWhenPutDownInHomeZone) {
            addRequirementsByCard({ playerId, card });
        }

        if (ImplementedEventCards.includes(cardData.commonId)) {
            stateChangeListener.snapshot();
        }
        else {
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

    function putDownCardInZone({ playerId, cardData }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        playerStateService.putDownCardInZone(cardData);
        matchComService.emitToOpponentOf(playerId, 'putDownOpponentCard', { location: 'zone', card: cardData });
    }
}

module.exports = PutDownCardController;