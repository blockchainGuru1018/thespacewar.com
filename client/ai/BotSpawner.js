const Bot = require("./Bot.js");
const GameServiceFactory = require("../../shared/match/GameServiceFactory.js");
const PlayerServiceFactory = require("../../shared/match/PlayerServiceFactory.js");
const CardRulesFactory = require("./cardRules/CardRulesFactory.js");
const DrawPhaseDecider = require("./DrawPhaseDecider.js");
const PreparationPhaseDecider = require("./PreparationPhaseDecider.js");
const ActionPhaseDecider = require("./ActionPhaseDecider.js");
const DiscardPhaseDecider = require("./DiscardPhaseDecider.js");
const AttackPhaseDecider = require("./AttackPhaseDecider.js");
const DecideCardToDiscard = require("./DecideCardToDiscard.js");
const DecideCardToSacrifice = require("./DecideCardToSacrifice.js");
const DecideRowForStationCard = require("./DecideRowForStationCard.js");
const DecideCardToPlaceAsStationCard = require("./DecideCardToPlaceAsStationCard.js");
const PlayCardCapability = require("./cardCapabilities/PlayCardCapability.js");
const CardCapabilityFactory = require("./cardCapabilities/CardCapabilityFactory.js");
const LuckPlayer = require("./cardPlayers/LuckPlayer.js");
const ExcellentWorkPlayer = require("./cardPlayers/ExcellentWorkPlayer.js");
const DestroyDurationPlayer = require("./cardPlayers/DestroyDurationPlayer.js");
const RequirementPlayerFactory = require("./requirementPlayers/RequirementPlayerFactory.js");

const BotId = "BOT";

let timeoutId = null;

module.exports = function ({
  opponentUserId,
  clientState,
  matchController,
  rawCardDataRepository,
  userRepository,
  gameConfig,
  delay = false,
  createBot = (options) => Bot(options),
}) {
  let playerServiceFactory;
  let gameServiceFactory;

  return {
    spawn: spawnWithDelayIfSet,
  };

  function spawnWithDelayIfSet() {
    if (delay) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(
        spawn,
        gameConfig.secondsOfWaitBetweenActionsOfAiBot()
      );
    } else {
      spawn();
    }
  }

  function spawn() {
    const state = clientState.toServerState();
    gameServiceFactory = GameServiceFactory({
      state,
      endMatch: () => console.info("END MATCH"),
      rawCardDataRepository,
      gameConfig,
    });
    playerServiceFactory = PlayerServiceFactory({
      state,
      logger: (...args) => console.log("LOGGER:", ...args),
      endMatch: () => console.info("END MATCH"),
      gameConfig,
      actionPointsCalculator: gameServiceFactory.actionPointsCalculator(),
      gameServiceFactory,
      userRepository,
    });

    createBot({
      matchService: gameServiceFactory.matchService(),
      playerStateService: playerServiceFactory.playerStateService(BotId),
      queryPlayerRequirements: playerServiceFactory.queryPlayerRequirements(
        BotId
      ),
      playerRuleService: playerServiceFactory.playerRuleService(BotId),
      playerCommanders: playerServiceFactory.playerCommanders(BotId),
      playerPhase: playerServiceFactory.playerPhase(BotId),
      turnControl: playerServiceFactory.turnControl(BotId),
      opponentStateService: playerServiceFactory.playerStateService(
        opponentUserId
      ),
      decideCardToDiscard: decideCardToDiscard(),
      decideCardToSacrifice: decideCardToSacrifice(),
      drawPhaseDecider: drawPhaseDecider(),
      preparationPhaseDecider: preparationPhaseDecider(),
      actionPhaseDecider: actionPhaseDecider(),
      discardPhaseDecider: discardPhaseDecider(),
      attackPhaseDecider: attackPhaseDecider(),
      matchController,
      clientState,
      requirementsPlayer: requirementPlayers(),
    });
  }
  function requirementPlayers() {
    const requirementPlayerFactory = RequirementPlayerFactory({
      opponentUserId,
      BotId,
      playerServiceFactory,
      matchController,
    });
    return requirementPlayerFactory.createAll();
  }
  function drawPhaseDecider() {
    return DrawPhaseDecider({
      matchController,
      playerDrawPhase: playerServiceFactory.playerDrawPhase(BotId),
    });
  }

  function preparationPhaseDecider() {
    return PreparationPhaseDecider({
      matchController,
    });
  }

  function actionPhaseDecider() {
    const playerStateService = playerServiceFactory.playerStateService(BotId);
    return ActionPhaseDecider({
      matchController,
      playerStateService,
      playerServiceFactory,
      playerRuleService: playerServiceFactory.playerRuleService(BotId),
      decideRowForStationCard: decideRowForStationCard(),
      decideCardToPlaceAsStationCard: DecideCardToPlaceAsStationCard({
        playerStateService,
      }),
      playCardCapability: playCardCapability(),
    });
  }

  function playCardCapability() {
    return PlayCardCapability({
      playerStateService: playerServiceFactory.playerStateService(BotId),
      matchController,
      cardRules: cardRules(),
      cardPlayers: [
        LuckPlayer({ matchController }),
        ExcellentWorkPlayer({
          matchController,
          decideRowForStationCard: decideRowForStationCard(),
          playerRuleService: playerServiceFactory.playerRuleService(BotId),
        }),
        DestroyDurationPlayer({
          matchController,
          opponentStateService: playerServiceFactory.playerStateService(
            opponentUserId
          ),
        }),
      ],
    });
  }

  function discardPhaseDecider() {
    return DiscardPhaseDecider({
      matchController,
      playerDiscardPhase: playerServiceFactory.playerDiscardPhase(BotId),
      decideCardToDiscard: decideCardToDiscard(),
    });
  }

  function attackPhaseDecider() {
    return AttackPhaseDecider({
      matchController,
      playerStateService: playerServiceFactory.playerStateService(BotId),
      opponentStateService: playerServiceFactory.playerStateService(
        opponentUserId
      ),
      cardCapabilityFactory: CardCapabilityFactory({
        playerServiceFactory,
        playerId: BotId,
        opponentId: opponentUserId,
        matchController,
      }),
    });
  }

  function decideCardToDiscard() {
    return DecideCardToDiscard({
      playerStateService: playerServiceFactory.playerStateService(BotId),
    });
  }

  function decideCardToSacrifice() {
    return DecideCardToSacrifice({
      playerStateService: playerServiceFactory.playerStateService(BotId),
    });
  }

  function decideRowForStationCard() {
    return DecideRowForStationCard({
      playerStateService: playerServiceFactory.playerStateService(BotId),
    });
  }

  function cardRules() {
    const cardRulesFactory = CardRulesFactory({
      BotId,
      opponentUserId,
      playerServiceFactory,
    });
    return cardRulesFactory.createAll();
  }
};
