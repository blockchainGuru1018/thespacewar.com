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
    matchController
}) {

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
            actionPhase();
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

    function actionPhase() {
        const cardsOnHand = playerStateService.getCardsOnHand();
        const actionPoints = playerStateService.getActionPointsForPlayer();
        const affordableCard = cardsOnHand.find(c => c.cost <= actionPoints);
        if (affordableCard) {
            matchController.emit('putDownCard', { cardId: affordableCard.id, location: 'zone' });
        }
        else {
            matchController.emit('nextPhase', { currentPhase: PHASES.action });
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
            matchController.emit('selectStartingStationCard', { cardId: cardsOnHand[0].id, location: 'action' });
        }
        else if (!playerCommanders.hasSelectedSomeCommander()) {
            matchController.emit('selectCommander', { commander: Commander.FrankJohnson });
        }
        else if (!playerStateService.isReadyForGame()) {
            matchController.emit('playerReady');
        }
    }

    function choosingStartingPlayer() {
        matchController.emit('selectPlayerToStart', { playerToStartId: BotId });
    }
};
