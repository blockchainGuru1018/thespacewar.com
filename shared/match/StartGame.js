const CheatError = require('../../server/match/CheatError.js');

function StartGameController({
    matchService,
    playerStateService,
    playerRequirementService,
    opponentStateService,
    opponentRequirementService,
    playerPhase,
    opponentPhase,
    playerRuleService
}) {

    return {
        selectPlayerToStart,
        selectStartingStationCard
    };

    function selectPlayerToStart(playerToStartId) {
        const playerId = playerStateService.getPlayerId();

        const playerToStartPhaseService = playerToStartId === playerId ? playerPhase : opponentPhase;
        playerToStartPhaseService.selectToStart();

        const secondPlayerRequirementService = playerStateService.isFirstPlayer() ? opponentRequirementService : playerRequirementService;
        secondPlayerRequirementService.addDrawCardRequirement({ count: 1 });

        playerStateService.readyForSelectingStationCards();
        opponentStateService.readyForSelectingStationCards();

        matchService.startSelectingStationCards();
    }

    function selectStartingStationCard({ cardId, location }) {
        if (!playerRuleService.canPutDownMoreStartingStationCards()) throw new CheatError('Cannot put down more starting station cards');
        if (!playerStateService.hasCardOnHand(cardId)) throw new CheatError('Card is not on hand');

        playerStateService.selectStartingStationCard(cardId, location);
    }
}

module.exports = StartGameController;
