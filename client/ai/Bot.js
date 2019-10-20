const MatchMode = require('../../shared/match/MatchMode.js');
const Commander = require('../../shared/match/commander/Commander.js');

module.exports = function ({
    matchService,
    playerStateService,
    playerRequirementService,
    playerRuleService,
    playerPhase,
    playerCommanders,
    turnControl,
    opponentStateService,
    drawPhaseDecider,
    preparationPhaseDecider,
    actionPhaseDecider,
    discardPhaseDecider,
    decideCardToDiscard,
    attackPhaseDecider,
    matchController
}) {
    if (playerRequirementService.isWaitingOnOpponentFinishingRequirement()) return;
    if (hasAnyRequirement()) {
        performRequirement();
    }

    if (matchService.isGameOn() && turnControl.opponentHasControl()) return;

    if (isChoosingStartingPlayer()) {
        choosingStartingPlayer();
    }
    else if (isSelectingStartingStationCards()) {
        selectingStartingStationCards();
    }
    else {
        if (playerPhase.isDraw()) {
            drawPhaseDecider.decide();
        }
        else if (playerPhase.isPreparation()) {
            preparationPhaseDecider.decide();
        }
        else if (playerPhase.isAction()) {
            actionPhaseDecider.decide();
        }
        else if (playerPhase.isDiscard()) {
            discardPhaseDecider.decide();
        }
        else if (playerPhase.isAttack()) {
            attackPhaseDecider.decide();
        }
    }

    function isChoosingStartingPlayer() {
        return matchService.mode() === MatchMode.chooseStartingPlayer
            && matchService.getCurrentPlayer() === playerStateService.getPlayerId();
    }

    function isSelectingStartingStationCards() {
        return matchService.mode() === MatchMode.selectStationCards;
    }

    function selectingStartingStationCards() {
        const canPutDownMoreStationCards = playerRuleService.canPutDownMoreStartingStationCards();
        if (canPutDownMoreStationCards) {
            const cardsOnHand = playerStateService.getCardsOnHand();
            const location = locationForStartingStationCard();
            matchController.emit('selectStartingStationCard', { cardId: cardsOnHand[0].id, location });
        }
        else if (!playerCommanders.hasSelectedSomeCommander()) {
            matchController.emit('selectCommander', { commander: Commander.FrankJohnson });
        }
        else if (!playerStateService.isReadyForGame()) {
            matchController.emit('playerReady');
        }
    }

    function locationForStartingStationCard() {
        const cardsSelected = playerRuleService.amountOfStartingStationCardsSelected();
        if (cardsSelected === 0) {
            return 'draw';
        }
        else if (cardsSelected === 1) {
            return 'action';
        }
        else if (cardsSelected === 2) {
            return 'handSize';
        }
        else {
            return 'action';
        }
    }

    function choosingStartingPlayer() {
        matchController.emit('selectPlayerToStart', { playerToStartId: playerStateService.getPlayerId() });
    }

    function damageOpponentStationCards() {
        const targetIds = opponentStateService.getUnflippedStationCards().slice(0, getDamageStationCardRequirementCount()).map(c => c.id);
        matchController.emit('damageStationCards', { targetIds });
    }

    function hasRequirementOfType(type) {
        return !!getRequirementOfType(type);
    }

    function getDamageStationCardRequirementCount() {
        return getRequirementOfType('damageStationCard').count;
    }

    function getRequirementOfType(type) {
        return playerRequirementService.getFirstMatchingRequirement({ type });
    }

    function hasAnyRequirement() {
        return playerRequirementService.hasAnyRequirement();
    }

    function performRequirement() {
        if (hasRequirementOfType('drawCard')) {
            matchController.emit('drawCard');
        }
        else if (hasRequirementOfType('discardCard')) {
            matchController.emit('discardCard', decideCardToDiscard());
        }
        else if (hasRequirementOfType('damageStationCard')) {
            damageOpponentStationCards();
        }
    }
};
