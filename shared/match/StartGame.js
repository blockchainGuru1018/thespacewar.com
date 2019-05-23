const CheatError = require('../../server/match/CheatError.js');

function StartGameController({
    matchService,
    playerStateService,
    playerRequirementService,
    opponentStateService,
    opponentRequirementService,
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
                const secondPlayerRequirementService = playerStateService.isFirstPlayer() ? opponentRequirementService : playerRequirementService;
                secondPlayerRequirementService.addDrawCardRequirement({ count: 1 });
                matchService.startGame();
            }
        }
    }
}

module.exports = StartGameController;
