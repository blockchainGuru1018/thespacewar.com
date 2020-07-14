const DEFAULT_CONFIG = require("../gameConfig.js");

const propertyMap = {
  AMOUNT_OF_CARDS_IN_START_HAND: "amountOfCardsInStartHand",
  MILL_CARD_AMOUNT: "millCardCount",
  STATION_CARDS_AT_START: "stationCardsAtStart",
  MAX_STATION_CARDS: "maxStationCards",
  MAX_REPLACES: "maxReplaces",
  TIME_TO_COUNTER: "timeToCounter",
  ACCESS_KEY: "accessKey",
  NICIA_SATU_STARTS_WITH_ENERGY_SHIELD: "niciaSatuStartsWithEnergyShield",
  TIME_PER_PLAYER_IN_MINUTES: "timePerPlayerInMinutes",
  RECYCLE_AT_START_OF_GAME: "recycleAtStartOfGame",
  SECONDS_OF_WAIT_BETWEEN_ACTIONS_OF_AI_BOT:
    "secondsOfWaitBetweenActionsOfAiBot",
  MINUTES_OF_INACTIVITY_RESULT_IN_AUTOLOSS:
    "minutesOfInactivityResultInAutoLoss",
  MINUTES_OF_INACTIVITY_RESULT_IN_AUTOLOSS_VS_BOT:
    "minutesOfInactivityResultInAutoLossVsBot",
};

const Defaults = convertConfig(DEFAULT_CONFIG);

GameConfig.notLoaded = notLoaded;

GameConfig.fromConfig = (config) => GameConfig(convertConfig(config));

function GameConfig({
  amountOfCardsInStartHand = Defaults.amountOfCardsInStartHand,
  millCardCount = Defaults.millCardCount,
  stationCardsAtStart = Defaults.stationCardsAtStart,
  maxStationCards = Defaults.maxStationCards,
  maxReplaces = Defaults.maxReplaces,
  timeToCounter = Defaults.timeToCounter,
  accessKey = Defaults.accessKey,
  timePerPlayerInMinutes = Defaults.accessKey,
  niciaSatuStartsWithEnergyShield = Defaults.niciaSatuStartsWithEnergyShield,
  recycleAtStartOfGame = Defaults.recycleAtStartOfGame,
  secondsOfWaitBetweenActionsOfAiBot = Defaults.secondsOfWaitBetweenActionsOfAiBot,
  minutesOfInactivityResultInAutoLoss = Defaults.minutesOfInactivityResultInAutoLoss,
  minutesOfInactivityResultInAutoLossVsBot = Defaults.minutesOfInactivityResultInAutoLossVsBot,
} = {}) {
  return {
    entity: () => ({ ...arguments[0] }),
    amountOfCardsInStartHand: () => amountOfCardsInStartHand,
    millCardCount: () => millCardCount,
    stationCardsAtStart: () => stationCardsAtStart,
    maxStationCards: () => maxStationCards,
    maxReplaces: () => maxReplaces,
    timeToCounter: () => timeToCounter,
    accessKey: () => accessKey,
    timePerPlayerInMinutes: () => timePerPlayerInMinutes,
    niciaSatuStartsWithEnergyShield: () => niciaSatuStartsWithEnergyShield,
    recycleAtStartOfGame: () => recycleAtStartOfGame,
    secondsOfWaitBetweenActionsOfAiBot: () =>
      Math.round(secondsOfWaitBetweenActionsOfAiBot * 1000),
    minutesOfInactivityResultInAutoLoss: () =>
      Math.round(minutesOfInactivityResultInAutoLoss * 1000 * 60),
    minutesOfInactivityResultInAutoLossVsBot: () =>
      Math.round(minutesOfInactivityResultInAutoLossVsBot * 1000 * 60),
  };
}

function notLoaded() {
  return GameConfig();
}

function convertConfig(config) {
  const result = {};
  for (const key of Object.keys(config)) {
    result[propertyMap[key]] = config[key];
  }
  return result;
}

module.exports = GameConfig;
