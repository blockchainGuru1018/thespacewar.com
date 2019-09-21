const Bot = require('./Bot.js');
const GameServiceFactory = require('../../shared/match/GameServiceFactory.js');
const PlayerServiceFactory = require('../../shared/match/PlayerServiceFactory.js');
const DrawPhaseDecider = require('./DrawPhaseDecider.js');
const ActionPhaseDecider = require('./ActionPhaseDecider.js');
const DiscardPhaseDecider = require('./DiscardPhaseDecider.js');
const AttackPhaseDecider = require('./AttackPhaseDecider.js');
const DecideCardToDiscard = require('./DecideCardToDiscard.js');
const DecideRowForStationCard = require('./DecideRowForStationCard.js');
const DecideCardToPlaceAsStationCard = require('./DecideCardToPlaceAsStationCard.js');
const CardCapabilityFactory = require('./cardCapabilities/CardCapabilityFactory.js');

const BotId = 'BOT';

module.exports = function ({
    opponentUserId,
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
            playerRequirementService: playerServiceFactory.playerRequirementService(BotId),
            playerRuleService: playerServiceFactory.playerRuleService(BotId),
            playerCommanders: playerServiceFactory.playerCommanders(BotId),
            playerPhase: playerServiceFactory.playerPhase(BotId),
            turnControl: playerServiceFactory.turnControl(BotId),
            opponentStateService: playerServiceFactory.playerStateService(opponentUserId),
            decideCardToDiscard: decideCardToDiscard(),
            drawPhaseDecider: drawPhaseDecider(),
            actionPhaseDecider: actionPhaseDecider(),
            discardPhaseDecider: discardPhaseDecider(),
            attackPhaseDecider: attackPhaseDecider(),
            matchController,
            clientState
        });
    }

    function drawPhaseDecider() {
        return DrawPhaseDecider({
            playerRuleService: playerServiceFactory.playerRuleService(BotId),
            matchController
        });
    }

    function actionPhaseDecider() {
        const playerStateService = playerServiceFactory.playerStateService(BotId);
        return ActionPhaseDecider({
            matchController,
            playerStateService,
            playerRuleService: playerServiceFactory.playerRuleService(BotId),
            decideRowForStationCard: DecideRowForStationCard(),
            decideCardToPlaceAsStationCard: DecideCardToPlaceAsStationCard({ playerStateService })
        });
    }

    function discardPhaseDecider() {
        return DiscardPhaseDecider({
            matchController,
            playerDiscardPhase: playerServiceFactory.playerDiscardPhase(BotId),
            decideCardToDiscard: decideCardToDiscard()
        });
    }

    function attackPhaseDecider() {
        return AttackPhaseDecider({
            matchController,
            playerStateService: playerServiceFactory.playerStateService(BotId),
            opponentStateService: playerServiceFactory.playerStateService(opponentUserId),
            cardCapabilityFactory: CardCapabilityFactory({
                playerServiceFactory,
                opponentId: opponentUserId,
                matchController
            })
        });
    }

    function decideCardToDiscard() {
        return DecideCardToDiscard({ playerStateService: playerServiceFactory.playerStateService(BotId) });
    }
};
