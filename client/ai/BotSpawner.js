const Bot = require('./Bot.js');
const GameServiceFactory = require('../../shared/match/GameServiceFactory.js');
const PlayerServiceFactory = require('../../shared/match/PlayerServiceFactory.js');
const ActionPhaseDecider = require('./ActionPhaseDecider.js');
const DiscardPhaseDecider = require('./DiscardPhaseDecider.js');
const AttackPhaseDecider = require('./AttackPhaseDecider.js');
const DecideCardToDiscard = require('./DecideCardToDiscard.js');
const DecideRowForStationCard = require('./DecideRowForStationCard.js');
const DecideCardToPlaceAsStationCard = require('./DecideCardToPlaceAsStationCard.js');

const BotId = 'BOT';

module.exports = function ({
    clientState,
    matchController,
    rawCardDataRepository,
    userRepository,
    gameConfig,
    createBot = options => Bot(options)
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

        createBot({
            matchService: gameServiceFactory.matchService(),
            playerStateService: playerServiceFactory.playerStateService(BotId),
            playerRuleService: playerServiceFactory.playerRuleService(BotId),
            playerCommanders: playerServiceFactory.playerCommanders(BotId),
            playerPhase: playerServiceFactory.playerPhase(BotId),
            turnControl: playerServiceFactory.turnControl(BotId),
            actionPhaseDecider: actionPhaseDecider(),
            discardPhaseDecider: discardPhaseDecider(),
            attackPhaseDecider: attackPhaseDecider(),
            matchController,
            clientState
        });
    }

    function actionPhaseDecider() {
        const playerStateService = playerServiceFactory.playerStateService(BotId);
        return ActionPhaseDecider({
            playerStateService,
            playerRuleService: playerServiceFactory.playerRuleService(BotId),
            decideRowForStationCard: DecideRowForStationCard(),
            decideCardToPlaceAsStationCard: DecideCardToPlaceAsStationCard({ playerStateService }),
            matchController
        });
    }

    function discardPhaseDecider() {
        return DiscardPhaseDecider({
            playerDiscardPhase: playerServiceFactory.playerDiscardPhase(BotId),
            decideCardToDiscard: DecideCardToDiscard({ playerStateService: playerServiceFactory.playerStateService(BotId) }),
            matchController
        });
    }

    function attackPhaseDecider() {
        return AttackPhaseDecider({
            playerStateService: playerServiceFactory.playerStateService(BotId),
            matchController
        });
    }
};
