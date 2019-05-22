const DEFAULT_CONFIG = require('../gameConfig.js');

const propertyMap = {
    AMOUNT_OF_CARDS_IN_START_HAND: 'amountOfCardsInStartHand',
    OVERWORK_IS_ACTIVE: 'overworkIsActive',
    MILL_CARD_AMOUNT: 'millCardCount',
    STATION_CARDS_AT_START: 'stationCardsAtStart'
};

const Defaults = convertConfig(DEFAULT_CONFIG);

GameConfig.notLoaded = notLoaded;

GameConfig.fromConfig = config => GameConfig(convertConfig(config));

function GameConfig({
    amountOfCardsInStartHand = Defaults.amountOfCardsInStartHand,
    overworkIsActive = Defaults.overworkIsActive,
    millCardCount = Defaults.millCardCount,
    stationCardsAtStart = Defaults.stationCardsAtStart,
} = {}) {

    return {
        entity: () => ({ ...arguments[0] }),
        amountOfCardsInStartHand: () => amountOfCardsInStartHand,
        overworkIsActive: () => overworkIsActive,
        millCardCount: () => millCardCount,
        stationCardsAtStart: () => stationCardsAtStart
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

