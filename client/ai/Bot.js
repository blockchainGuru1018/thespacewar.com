const { PHASES } = require('../../shared/phases.js');
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));
const ActionPhaseController = require('./ActionPhaseController.js');
const DiscardPhaseController = require('./DiscardPhaseController.js');
const AttackPhaseController = require('./AttackPhaseController.js');

const WaitTime = 800;

//TODO
// Needs to look at state NOT through Vuex. Either a clientSide version of state independent of Vuex. Or only through objects created with "server state".
// Can use playerServiceFactory? To create dependencies needed to query state.

module.exports = function ({
    rootStore,
    matchController,
}) {

    const actionPhaseController = ActionPhaseController();
    const discardPhaseController = DiscardPhaseController();
    const attackPhaseController = AttackPhaseController();

    function start() {
        onUpdate(act);
    }

    async function act() {
        if (hasGameEnded()) {
            gameEnded();
        }
        else if (isGameOn()) {
            gameOn();
        }
        else if (isChoosingStartingPlayer()) {
            choosingStartingPlayer();
        }
        else if (isSelectingStartingStationCards()) {
            selectingStartingStationCards();
        }
    }

    function gameOn() {
        if (turnControl.playerHasControlOfOwnTurn()) {
            if (playerPhase.isPreparation()) {
                isPreparationPhase();
            }
            else if (playerPhase.isAction()) {
                actionPhaseController.onActionPhase();
            }
            else if (playerPhase.isDiscardPhase()) {
                discardPhaseController.onDiscardPhase();
            }
            else if (playerPhase.isAttackPhase()) {
                attackPhaseController.onAttackPhase();
            }
        }
    }

    function gameEnded() {
        //TODO Implement behaviour to stop listening to server and etc.
        // Or maybe this is not necessary?
        // But this module must be discarded when the player leaves the match page.
    }

    function isPreparationPhase() {
        matchController.emit('nextPhase');
    }
};

function wait(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
