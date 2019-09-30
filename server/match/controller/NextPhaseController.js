const CheatError = require('../CheatError.js');
const PlayerServiceProvider = require('../../../shared/match/PlayerServiceProvider.js');

function NextPhaseCardController(deps) {

    const {
        matchService,
        matchComService,
        playerServiceProvider,
        playerServiceFactory
    } = deps;

    return {
        onNextPhase,
        onToggleControlOfTurn,
        playerReady,
        passDrawPhase
    };

    function onNextPhase(playerId, { currentPhase }) {
        const playerPhase = playerServiceFactory.playerPhase(playerId);
        if (currentPhase !== playerPhase.get()) return;

        const playerPhaseControl = playerServiceFactory.playerPhaseControl(playerId);
        playerPhaseControl.validateCanGoToNextPhase();
        playerPhaseControl.nextPhase();

        matchComService.emitCurrentStateToPlayers();
    }

    function onToggleControlOfTurn(playerId) {
        const turnControl = playerServiceProvider.byTypeAndId(PlayerServiceProvider.TYPE.turnControl, playerId);
        if (!turnControl.canToggleControlOfTurn()) throw new CheatError('Cannot toggle control of turn');

        turnControl.toggleControlOfTurn();
        matchComService.emitCurrentStateToPlayers();
    }

    function playerReady(playerId) {
        const playerRuleService = playerServiceFactory.playerRuleService(playerId);
        if (playerRuleService.canPutDownMoreStartingStationCards()) throw new CheatError('Must select all starting station cards before reading');

        matchService.update(state => {
            state.readyPlayerIds.push(playerId);
        });

        if (matchService.allPlayersReady()) {
            matchService.startGame();

            const playerOrder = matchService.getPlayerOrder();
            for (playerId of playerOrder) {
                const playerStartGame = playerServiceFactory.startGame(playerId);
                playerStartGame.startedGame();
            }

            const firstPlayerId = playerOrder[0];
            const playerPhase = playerServiceFactory.playerPhase(firstPlayerId);
            onNextPhase(firstPlayerId, { currentPhase: playerPhase.get() });
        }

        matchComService.emitCurrentStateToPlayers();
    }

    function passDrawPhase(playerId) {
        const canPassDrawPhase = playerServiceFactory.playerRuleService(playerId).canPassDrawPhase(playerId);
        if (!canPassDrawPhase) {
            throw new CheatError('Cannot pass draw phase');
        }

        onNextPhase(playerId, { currentPhase: 'draw' });
    }
}

module.exports = NextPhaseCardController;
