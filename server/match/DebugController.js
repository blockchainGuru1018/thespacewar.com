const fs = require('fs');
const path = require('path');
const SAVE_FOLDER = path.join(__dirname, 'save');
const Deck = require('../deck/Deck.js');
const CardDataAssembler = require('../../shared/CardDataAssembler.js');

function DebugController(deps) {

    const {
        matchService,
        restoreFromState,
        rawCardDataRepository
    } = deps;

    let cardDataAssembler = CardDataAssembler({ rawCardDataRepository });

    return {
        onSaveMatch,
        onRestoreSavedMatch,
        timeAlive
    };

    function onSaveMatch(playerId, saveName) {
        throw new Error('Not supported at the moment');

        // let filePath = path.join(SAVE_FOLDER, `${saveName}.json`);
        //
        // let stateCopy = { ...matchService.getState() };
        // const [firstPlayerId, secondPlayerId] = stateCopy.playerOrder;
        //
        // let stateJson = JSON.stringify({
        //     state: stateCopy,
        //     saverPlayerId: playerId
        // });
        // fs.writeFileSync(filePath, stateJson, 'utf8');
    }

    function onRestoreSavedMatch(playerId, { saveName, opponentId }) {
        throw new Error('Not supported at the moment');

        // let filePath = path.join(SAVE_FOLDER, `${saveName}.json`);
        // let restoredStateJson = fs.readFileSync(filePath, 'utf8');
        //
        // let { state: restoredState, saverPlayerId } = JSON.parse(restoredStateJson);
        // let previousOpponentId = restoredState.playerOrder.find(id => id !== saverPlayerId);
        //
        // const newPlayerStateById = {
        //     [playerId]: restoredState.playerStateById[saverPlayerId],
        //     [opponentId]: restoredState.playerStateById[previousOpponentId]
        // };
        // restoredState.playerStateById = newPlayerStateById;
        //
        // restoredState.currentPlayer = restoredState.currentPlayer === saverPlayerId ? playerId : opponentId;
        // let { playerOrder } = matchService.getState();
        // restoredState.playerOrder = playerOrder;
        //
        // restoreFromState(restoredState);
    }

    function timeAlive() {
        const startTime = matchService.getGameStartTime();
        if (!startTime) return Infinity;
        return Date.now() - startTime;
    }
}

module.exports = DebugController;
