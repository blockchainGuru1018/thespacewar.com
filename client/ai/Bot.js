const { PHASES } = require('../../shared/phases.js');
const MatchMode = require('../../shared/match/MatchMode.js');
const Commander = require('../../shared/match/commander/Commander.js');

const BotId = 'BOT';

module.exports = function ({
    matchService,
    playerStateService,
    playerRuleService,
    playerPhase,
    playerCommanders,
    turnControl,
    drawPhaseDecider,
    actionPhaseDecider,
    discardPhaseDecider,
    attackPhaseDecider,
    matchController
}) {
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
        return matchService.mode() === MatchMode.chooseStartingPlayer;
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
        matchController.emit('selectPlayerToStart', { playerToStartId: BotId });
    }
};
