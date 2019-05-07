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
        onRestoreSavedMatch
    };

    function onSaveMatch(playerId, saveName) {
        let filePath = path.join(SAVE_FOLDER, `${saveName}.json`);

        let stateCopy = { ...matchService.getState() };
        const [firstPlayerId, secondPlayerId] = stateCopy.playerOrder;

        stateCopy.deckRestoreDataByPlayerId = {
            [firstPlayerId]: stateCopy.deckByPlayerId[firstPlayerId]._getDeck(),
            [secondPlayerId]: stateCopy.deckByPlayerId[secondPlayerId]._getDeck(),
        };

        let stateJson = JSON.stringify({
            state: stateCopy,
            saverPlayerId: playerId
        });
        fs.writeFileSync(filePath, stateJson, 'utf8');
    }

    function onRestoreSavedMatch(playerId, { saveName, opponentId }) {
        let filePath = path.join(SAVE_FOLDER, `${saveName}.json`);
        let restoredStateJson = fs.readFileSync(filePath, 'utf8');

        let { state: restoredState, saverPlayerId } = JSON.parse(restoredStateJson);
        let previousOpponentId = restoredState.playerOrder.find(id => id !== saverPlayerId);

        const newPlayerStateById = {
            [playerId]: restoredState.playerStateById[saverPlayerId],
            [opponentId]: restoredState.playerStateById[previousOpponentId]
        };
        restoredState.playerStateById = newPlayerStateById;

        const playerDeck = Deck({ cardDataAssembler });
        playerDeck._restoreDeck(restoredState.deckRestoreDataByPlayerId[saverPlayerId]);

        const opponentDeck = Deck({ cardDataAssembler });
        opponentDeck._restoreDeck(restoredState.deckRestoreDataByPlayerId[previousOpponentId]);

        delete restoredState.deckRestoreDataByPlayerId;

        const newDeckByPlayerId = {
            [playerId]: playerDeck,
            [opponentId]: opponentDeck
        }
        restoredState.deckByPlayerId = newDeckByPlayerId;

        restoredState.currentPlayer = restoredState.currentPlayer === saverPlayerId ? playerId : opponentId;
        let { playerOrder } = matchService.getState();
        restoredState.playerOrder = playerOrder;

        restoreFromState(restoredState);
    }
}

module.exports = DebugController;
