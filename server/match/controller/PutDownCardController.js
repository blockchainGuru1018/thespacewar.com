const CheatError = require('../CheatError.js');
const CardApplier = require('../card/CardApplier.js');
const PlayerServiceProvider = require('../../../shared/match/PlayerServiceProvider.js');

function PutDownCardController(deps) {

    const {
        matchService,
        matchComService,
        cardFactory,
        playerServiceProvider,
        stateMemento,
        playerRequirementUpdaterFactory,
        playerServiceFactory
    } = deps;

    const cardApplier = CardApplier({ playerServiceProvider, playerServiceFactory, matchService });

    return {
        onPutDownCard,
        cancelCounterCard,
        counterCard
    };

    function onPutDownCard(playerId, { location, cardId, choice }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        let cardData = playerStateService.findCardFromAnySource(cardId);
        if (!cardData) throw new CheatError(`Cannot find card`);

        checkIfCanPutDownCard({ playerId, location, cardData });

        stateMemento.saveStateForCardId(cardId);

        removeCardFromCurrentLocation({ playerId, location, cardData });
        putDownCardAtNewLocation({ playerId, location, cardData, choice });
    }

    function cancelCounterCard(playerId, { cardId }) {
        validateIfCanProgressCounterCardRequirementByCount(0, playerId);
        removeCounterCardRequirment(playerId);

        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const card = playerStateService.createBehaviourCardById(cardId);
        if (card.type === 'event') {
            stateMemento.revertStateToBeforeCardWasPutDown(cardId);
        }

        matchComService.emitCurrentStateToPlayers();
    }

    function counterCard(playerId, { cardId, targetCardId }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        let cardData = playerStateService.findCardFromAnySource(cardId);
        if (!cardData) throw new CheatError(`Cannot find card`);
        const canThePlayer = playerServiceProvider.byTypeAndId(PlayerServiceProvider.TYPE.canThePlayer, playerId);
        if (!canThePlayer.counterCard({ id: targetCardId })) throw new CheatError('Cannot counter card');

        validateIfCanProgressCounterCardRequirementByCount(1, playerId);
        progressCounterCardRequirementByCount(1, playerId); //TODO Is this necessary? As the game resets below, also the requirement should reset...

        const card = playerStateService.createBehaviourCard(cardData);
        const opponentId = matchService.getOpponentId(playerId);
        const opponentStateService = playerServiceProvider.getStateServiceById(opponentId);
        const targetCard = opponentStateService.createBehaviourCardById(targetCardId);
        if (card.canCounterCard(targetCard)) {
            stateMemento.revertStateToBeforeCardWasPutDown(targetCardId);

            const opponentId = matchService.getOpponentId(playerId);
            const opponentStateService = playerServiceProvider.getStateServiceById(opponentId);
            opponentStateService.counterCard(targetCardId);

            playerStateService.useToCounter(cardId);

            const opponentActionLog = playerServiceFactory.actionLog(matchService.getOpponentId(playerId));
            opponentActionLog.opponentCounteredCard({ cardCommonId: targetCard.commonId });

            matchComService.emitCurrentStateToPlayers();
        }
    }

    function validateIfCanProgressCounterCardRequirementByCount(count, playerId) {
        const playerRequirementUpdater = playerRequirementUpdaterFactory.create(playerId, { type: 'counterCard' });
        let canProgressRequirement = playerRequirementUpdater.canProgressRequirementByCount(count);
        if (!canProgressRequirement) {
            throw new CheatError('Cannot counter card');
        }
    }

    function progressCounterCardRequirementByCount(count, playerId) {
        const playerRequirementUpdater = playerRequirementUpdaterFactory.create(playerId, { type: 'counterCard' });
        playerRequirementUpdater.progressRequirementByCount(count);
    }

    function removeCounterCardRequirment(playerId) {
        const playerRequirementUpdater = playerRequirementUpdaterFactory.create(playerId, { type: 'counterCard' });
        playerRequirementUpdater.resolve();
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

            const opponentActionLog = playerServiceFactory.actionLog(matchService.getOpponentId(playerId));
            opponentActionLog.opponentExpandedStation();
        }
        else {
            const opponentActionLog = playerServiceFactory.actionLog(matchService.getOpponentId(playerId));
            opponentActionLog.opponentPlayedCard({ cardCommonId: cardData.commonId });

            if (cardApplier.hasCommandForCard(cardData)) {
                cardApplier.putDownCard(playerId, cardData, { choice });
            }
            else {
                if (location === 'zone' && cardData.type === 'event') {
                    const playerStateService = playerServiceProvider.getStateServiceById(playerId);
                    playerStateService.putDownEventCardInZone(cardData);
                }
                else if (location === 'zone') {
                    putDownCardInZone({ playerId, cardData });
                }

                if (location === 'zone') {
                    const addRequirementFromSpec = playerServiceFactory.addRequirementFromSpec(playerId);
                    addRequirementFromSpec.forCardPutDownInHomeZone(cardData);
                }
            }

            const card = cardFactory.createCardForPlayer(cardData, playerId);
            if (card.requirementsWhenPutDownInHomeZone) {
                addCardRequirementsOnPutDownInHomeZone({ playerId, card });
            }
        }
    }

    function putDownStationCard({ playerId, cardData, location, choice }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        playerStateService.addStationCard(cardData, location, { putDownAsExtraStationCard: choice === 'putDownAsExtraStationCard' });
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
    }
}

module.exports = PutDownCardController;
