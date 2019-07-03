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
        playerReady
    };

    function onNextPhase(playerId) {
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
            const firstPlayerId = playerOrder[0];
            onNextPhase(firstPlayerId);
        }

        matchComService.emitCurrentStateToPlayers();
    }
}

module.exports = NextPhaseCardController;
