function StartGameController({
    matchService,
    matchComService,
    playerServiceProvider,
    playerServiceFactory,
    playerRequirementUpdaterFactory
}) {

    return {
        start,
        selectPlayerToStart,
        selectCommander,
        selectStartingStationCard,
        repairPotentiallyInconsistentState //TODO Move this to its own class
    };

    function start(playerId, { useTheSwarmDeck = false } = {}) {
        const playerIds = matchService.getPlayerIds();

        if (matchService.allPlayersConnected()) {
            repairPlayersPotentiallyInconsistentState(playerIds);
            matchComService.emitCurrentStateToPlayers();
        }
        else {
            matchService.connectPlayer(playerId);
            if (matchService.allPlayersConnected()) {
                resetPlayers(playerIds, useTheSwarmDeck);

                const playerGameTimer = playerServiceFactory.playerGameTimer(playerId);
                const timePerPlayer = matchService.getGameConfigEntity().timePerPlayerInMinutes;
                playerGameTimer.resetAll(timePerPlayer);

                matchComService.emitCurrentStateToPlayers();
            }
        }
    }

    function selectPlayerToStart(playerId, { playerToStartId }) {
        const startGame = playerServiceFactory.startGame(playerId);
        startGame.selectPlayerToStart(playerToStartId);

        matchComService.emitCurrentStateToPlayers();
    }

    function selectCommander(playerId, { commander }) {
        if (matchService.getReadyPlayerIds().includes(playerId)) throw new Error('Cannot select commander when has registered as ready');

        const playerCommanders = playerServiceFactory.playerCommanders(playerId);
        playerCommanders.select(commander);
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

    function resetPlayers(playerIds, useTheSwarmDeck) {
        for (const playerId of playerIds) {
            const playerStateService = playerServiceFactory.playerStateService(playerId);
            playerStateService.reset(useTheSwarmDeck);
        }
    }

    function repairPotentiallyInconsistentState(playerId) {
        const opponentId = matchService.getOpponentId(playerId);
        repairRequirements({
            playerStateService: playerServiceFactory.playerStateService(playerId),
            playerRequirementUpdaterFactory,
            playerRequirementService: playerServiceProvider.getRequirementServiceById(playerId),
            opponentRequirementService: playerServiceProvider.getRequirementServiceById(opponentId)
        });
    }
}

function repairRequirements({
    playerStateService,
    playerRequirementUpdaterFactory,
    playerRequirementService,
    opponentRequirementService
}) {
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

    const discardCardRequirement = playerRequirementService.getFirstMatchingRequirement({ type: 'discardCard' });
    if (discardCardRequirement && discardCardRequirement.count > 0) {
        const cardsOnHandCount = playerStateService.getCardsOnHandCount();
        if (cardsOnHandCount === 0 ) {
            const playerId = playerStateService.getPlayerId();
            const requirementUpdater = playerRequirementUpdaterFactory.create(playerId, { type: 'discardCard' });
            requirementUpdater.completeRequirement();
        }
    }

    const drawCardRequirement = playerRequirementService.getFirstMatchingRequirement({ type: 'drawCard' });
    if (drawCardRequirement && drawCardRequirement.count > 0) {
        const cardsInDeckCount = playerStateService.getDeck().getCardCount();
        if (cardsInDeckCount === 0) {
            const playerId = playerStateService.getPlayerId();
            const requirementUpdater = playerRequirementUpdaterFactory.create(playerId, { type: 'drawCard' });
            requirementUpdater.completeRequirement();
        }
    }
}

module.exports = StartGameController;
