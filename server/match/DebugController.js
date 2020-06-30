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

        restoredState.playerStateById = {
            [playerId]: restoredState.playerStateById[saverPlayerId],
            [opponentId]: restoredState.playerStateById[previousOpponentId]
        };

        restoredState.currentPlayer = restoredState.currentPlayer === saverPlayerId ? playerId : opponentId;
        const { playerOrder } = matchService.getState();
        restoredState.playerOrder = playerOrder;

        moveClockStartTime(restoredState.gameStartTime, restoredState); // Perhaps should start from last clock.event
        restoreFromState(restoredState);
    }

    function moveClockStartTime(timeForAction, state) {
        for (const playerId of Object.keys(state.playerStateById)) {
            const clock = state.playerStateById[playerId].clock;

            const now = Date.now();
            const timeSinceAction = now - timeForAction;
            clock.startTime += timeSinceAction;
            for (const event of clock.events) {
                event.time += timeSinceAction;
            }
        }
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
