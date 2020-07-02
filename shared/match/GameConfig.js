const DEFAULT_CONFIG = require('../gameConfig.js');

const propertyMap = {
    AMOUNT_OF_CARDS_IN_START_HAND: 'amountOfCardsInStartHand',
    MILL_CARD_AMOUNT: 'millCardCount',
    STATION_CARDS_AT_START: 'stationCardsAtStart',
    MAX_STATION_CARDS: 'maxStationCards',
    MAX_REPLACES: 'maxReplaces',
    TIME_TO_COUNTER: 'timeToCounter',
    ACCESS_KEY: 'accessKey',
    NICIA_SATU_STARTS_WITH_ENERGY_SHIELD: 'niciaSatuStartsWithEnergyShield',
    TIME_PER_PLAYER_IN_MINUTES: 'timePerPlayerInMinute',
    RECYCLE_AT_START_OF_GAME: 'recycleAtStartOfGame', 
};

const Defaults = convertConfig(DEFAULT_CONFIG);

GameConfig.notLoaded = notLoaded;

GameConfig.fromConfig = config => GameConfig(convertConfig(config));

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
    recycleAtStartOfGame = Defaults.recycleAtStartOfGame
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
        recycleAtStartOfGame: () => recycleAtStartOfGame
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

