const Deck = require('../deck/Deck.js');

module.exports = function ({
    cardDataAssembler
}) {

    return {
        serialize,
        parse
    };

    function serialize(state) {
        const [firstPlayerId, secondPlayerId] = state.playerOrder;

        const deckRestoreDataByPlayerId = {
            [firstPlayerId]: state.deckByPlayerId[firstPlayerId]._getDeck(),
            [secondPlayerId]: state.deckByPlayerId[secondPlayerId]._getDeck(),
        };

        return JSON.stringify({ ...state, deckByPlayerId: null, deckRestoreDataByPlayerId });
    }

    function parse(stateJson) {
        let restoredState = JSON.parse(stateJson);
        let [firstPlayer, secondPlayer] = restoredState.playerOrder;

        const newPlayerStateById = {
            [firstPlayer]: restoredState.playerStateById[firstPlayer],
            [secondPlayer]: restoredState.playerStateById[secondPlayer]
        };
        restoredState.playerStateById = newPlayerStateById;

        const playerDeck = Deck({ cardDataAssembler });
        playerDeck._restoreDeck(restoredState.deckRestoreDataByPlayerId[firstPlayer]);

        const opponentDeck = Deck({ cardDataAssembler });
        opponentDeck._restoreDeck(restoredState.deckRestoreDataByPlayerId[secondPlayer]);

        delete restoredState.deckRestoreDataByPlayerId;

        const newDeckByPlayerId = {
            [firstPlayer]: playerDeck,
            [secondPlayer]: opponentDeck
        };
        restoredState.deckByPlayerId = newDeckByPlayerId;
        return restoredState;
    }
};
