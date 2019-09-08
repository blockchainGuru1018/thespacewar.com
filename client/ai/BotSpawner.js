const Bot = require('./Bot.js');
const GameServiceFactory = require('../../shared/match/GameServiceFactory.js');
const PlayerServiceFactory = require('../../shared/match/PlayerServiceFactory.js');
const ActionPhaseDecider = require('./ActionPhaseDecider.js');

const BotId = 'BOT';

module.exports = function ({
    clientState,
    matchController,
    rawCardDataRepository,
    userRepository,
    gameConfig
}) {

    let playerServiceFactory;
    let gameServiceFactory;

    return {
        spawn
    };

    function spawn() {
        gameServiceFactory = GameServiceFactory({
            state: clientState.read(),
            endMatch: () => console.log('END MATCH'),
            rawCardDataRepository,
            gameConfig
        });
        playerServiceFactory = PlayerServiceFactory({
            state: clientState.toServerState(),
            logger: (...args) => console.log('LOGGER:', ...args),
            endMatch: () => console.log('END MATCH'),
            gameConfig,
            actionPointsCalculator: gameServiceFactory.actionPointsCalculator(),
            gameServiceFactory,
            userRepository
        });

        Bot({
            matchService: gameServiceFactory.matchService(),
            playerStateService: playerServiceFactory.playerStateService(BotId),
            playerRuleService: playerServiceFactory.playerRuleService(BotId),
            playerCommanders: playerServiceFactory.playerCommanders(BotId),
            playerPhase: playerServiceFactory.playerPhase(BotId),
            actionPhaseDecider: actionPhaseDecider(),
            matchController,
            clientState
        });
    }

    function actionPhaseDecider() {
        return ActionPhaseDecider({
            playerStateService: playerServiceFactory.playerStateService(BotId),
            matchController
        });
    }
};
