const { PHASES } = require('../../shared/phases.js');
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));
const ActionPhaseController = require('./ActionPhaseController.js');
const DiscardPhaseController = require('./DiscardPhaseController.js');
const AttackPhaseController = require('./AttackPhaseController.js');
const MatchMode = require('../../shared/match/MatchMode.js');
const Commander = require('../../shared/match/commander/Commander.js');

const WaitTime = 800;
const BotId = 'BOT';

module.exports = async function ({
    matchService,
    playerStateService,
    playerRuleService,
    playerPhase,
    playerCommanders,
    matchController
}) {

    // const actionPhaseController = ActionPhaseController();
    // const discardPhaseController = DiscardPhaseController();
    // const attackPhaseController = AttackPhaseController();

    // if (hasGameEnded()) {
    //     gameEnded();
    // }
    // else if (isGameOn()) {
    //     gameOn();
    // }

    if (isChoosingStartingPlayer()) {
        choosingStartingPlayer();
    }
    else if (isSelectingStartingStationCards()) {
        selectingStartingStationCards();
    }
    else {
        if (playerPhase.isDraw() && playerRuleService.moreCardsCanBeDrawnForDrawPhase()) {
            matchController.emit('drawCard');
        }
    }

    function gameOn() {
        // if (turnControl.playerHasControlOfOwnTurn()) {
        //     if (playerPhase.isPreparation()) {
        //         isPreparationPhase();
        //     }
        //     else if (playerPhase.isAction()) {
        //         actionPhaseController.onActionPhase();
        //     }
        //     else if (playerPhase.isDiscardPhase()) {
        //         discardPhaseController.onDiscardPhase();
        //     }
        //     else if (playerPhase.isAttackPhase()) {
        //         attackPhaseController.onAttackPhase();
        //     }
        // }
    }

    function gameEnded() {
        //TODO Implement behaviour to stop listening to server and etc.
        // Or maybe this is not necessary?
        // But this module must be discarded when the player leaves the match page.
    }

    function isPreparationPhase() {
        matchController.emit('nextPhase');
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

function wait(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
