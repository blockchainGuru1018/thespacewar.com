const CheatError = require('../../server/match/CheatError.js');

function StartGameController({
    matchService,
    playerStateService,
    opponentStateService,
    playerPhase,
    opponentPhase,
    canThePlayer,
    canTheOpponent
}) {

    return {
        selectPlayerToStart,
        selectStartingStationCard,
    };

    function selectPlayerToStart(playerToStartId) {
        const playerId = playerStateService.getPlayerId();

        const playerToStartStateService = playerToStartId === playerId ? playerPhase : opponentPhase;
        playerToStartStateService.selectToStart();

        playerStateService.readyForSelectingStationCards();
        opponentStateService.readyForSelectingStationCards();

        matchService.startSelectingStationCards();
    }

    function selectStartingStationCard({ cardId, location }) {
        if (!canThePlayer.putDownMoreStartingStationCards()) throw new CheatError('Cannot put down more starting station cards');

        playerStateService.selectStartingStationCard(cardId, location);
        if (!canThePlayer.putDownMoreStartingStationCards()) {
            playerStateService.doneSelectingStationCards();

            if (!canTheOpponent.putDownMoreStartingStationCards()) {
                matchService.startGame();
            }
        }
    }
}

module.exports = StartGameController;
