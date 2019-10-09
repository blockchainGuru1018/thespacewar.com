const fs = require('fs');
const path = require('path');
const SAVE_FOLDER = path.join(__dirname, 'save');

function DebugController(deps) {

    const {
        matchService,
        restoreFromState
    } = deps;

    return {
        onSaveMatch,
        onRestoreSavedMatch,
        timeAlive
    };

    function onSaveMatch(saverPlayerId, saveName) {
        const state = { ...matchService.getState() };
        const stateJson = JSON.stringify({ state, saverPlayerId });
        storeSavedGameJson(filePath(saveName), stateJson);
    }

    function onRestoreSavedMatch(playerId, { saveName, opponentId }) {
        const { state: restoredState, saverPlayerId } = readSavedGameData(saveName);
        const previousOpponentId = restoredState.playerOrder.find(id => id !== saverPlayerId);

        const newPlayerStateById = {
            [playerId]: restoredState.playerStateById[saverPlayerId],
            [opponentId]: restoredState.playerStateById[previousOpponentId]
        };
        restoredState.playerStateById = newPlayerStateById;

        restoredState.currentPlayer = restoredState.currentPlayer === saverPlayerId ? playerId : opponentId;
        let { playerOrder } = matchService.getState();
        restoredState.playerOrder = playerOrder;

        restoreFromState(restoredState);
    }

    function timeAlive() {
        const startTime = matchService.getGameStartTime();
        if (!startTime) return Infinity;
        return Date.now() - startTime;
    }

    function readSavedGameData(saveName) {
        const stateJson = fs.readFileSync(filePath(saveName), 'utf8');
        return JSON.parse(stateJson);
    }

    function storeSavedGameJson(saveFilePath, stateJson) {
        fs.writeFileSync(saveFilePath, stateJson, 'utf8');
    }

    function filePath(saveName) {
        return path.join(SAVE_FOLDER, `${saveName}.json`);
    }
}

module.exports = DebugController;
