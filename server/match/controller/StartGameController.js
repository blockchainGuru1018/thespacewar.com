function StartGameController({
    matchService,
    matchComService,
    playerServiceProvider,
    playerServiceFactory
}) {

    return {
        start,
        selectPlayerToStart,
        selectStartingStationCard,
        repairPotentiallyInconsistentState //TODO Move this to its own class
    };

    function start(playerId) {
        const playerIds = matchService.getPlayerIds();

        if (matchService.allPlayersReady()) {
            repairPlayersPotentiallyInconsistentState(playerIds);
            matchComService.emitCurrentStateToPlayers();
        }
        else {
            matchService.readyPlayer(playerId);
            if (matchService.allPlayersReady()) {
                resetPlayers(playerIds);
                matchComService.emitCurrentStateToPlayers();
            }
        }
    }

    function selectPlayerToStart(playerId, { playerToStartId }) {
        const startGame = playerServiceFactory.startGame(playerId);
        startGame.selectPlayerToStart(playerToStartId);

        matchComService.emitCurrentStateToPlayers();
    }

    function selectStartingStationCard(playerId, { cardId, location }) {
        const startGame = playerServiceFactory.startGame(playerId);
        startGame.selectStartingStationCard({ cardId, location });

        matchComService.emitCurrentStateToPlayers();
    }

    function repairPlayersPotentiallyInconsistentState(playerIds) {
        for (const playerId of playerIds) {
            repairPotentiallyInconsistentState(playerId);
        }
    }

    function resetPlayers(playerIds) {
        for (const playerId of playerIds) {
            const playerStateService = playerServiceFactory.playerStateService(playerId);
            playerStateService.reset();
        }
    }

    function repairPotentiallyInconsistentState(playerId) {
        const opponentId = matchService.getOpponentId(playerId);
        repairRequirements({
            playerRequirementService: playerServiceProvider.getRequirementServiceById(playerId),
            opponentRequirementService: playerServiceProvider.getRequirementServiceById(opponentId)
        });
    }
}

function repairRequirements({ playerRequirementService, opponentRequirementService }) {
    let playerWaitingRequirement = playerRequirementService.getFirstMatchingRequirement({ waiting: true });
    let opponentWaitingRequirement = opponentRequirementService.getFirstMatchingRequirement({ waiting: true });
    while (!!playerWaitingRequirement !== !!opponentWaitingRequirement) {
        if (playerWaitingRequirement) {
            playerRequirementService.removeFirstMatchingRequirement({ waiting: true });
        }
        else {
            opponentRequirementService.removeFirstMatchingRequirement({ waiting: true });
        }

        playerWaitingRequirement = playerRequirementService.getFirstMatchingRequirement({ waiting: true });
        opponentWaitingRequirement = opponentRequirementService.getFirstMatchingRequirement({ waiting: true });
    }
}

module.exports = StartGameController;
