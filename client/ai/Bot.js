const { PHASES } = require('../../shared/phases.js');
const MatchMode = require('../../shared/match/MatchMode.js');
const Commander = require('../../shared/match/commander/Commander.js');

const BotId = 'BOT';

module.exports = async function ({
    matchService,
    playerStateService,
    playerRuleService,
    playerPhase,
    playerCommanders,
    turnControl,
    actionPhaseDecider,
    discardPhaseDecider,
    matchController
}) {
    if (turnControl.opponentHasControl()) return;

    if (isChoosingStartingPlayer()) {
        choosingStartingPlayer();
    }
    else if (isSelectingStartingStationCards()) {
        selectingStartingStationCards();
    }
    else {
        if (playerPhase.isDraw()) {
            drawPhase();
        }
        else if (playerPhase.isAction()) {
            actionPhaseDecider.decide();
        }
        else if (playerPhase.isDiscard()) {
            discardPhase();
        }
        else if (playerPhase.isAttack()) {
            matchController.emit('nextPhase', { currentPhase: PHASES.attack });
        }
    }

    function drawPhase() {
        if (playerRuleService.moreCardsCanBeDrawnForDrawPhase()) {
            matchController.emit('drawCard');
        }
        else {
            matchController.emit('nextPhase', { currentPhase: PHASES.draw });
        }
    }

    function discardPhase() {
        discardPhaseDecider.decide();
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
        else {
            return 'handSize';
        }
    }

    function choosingStartingPlayer() {
        matchController.emit('selectPlayerToStart', { playerToStartId: BotId });
    }
};
