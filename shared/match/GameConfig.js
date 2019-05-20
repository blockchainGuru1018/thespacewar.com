const DEFAULT_CONFIG = require('../gameConfig.json');

GameConfig.notLoaded = () => ({
    entity: notLoaded,
    amountOfCardsInStartHand: notLoaded,
    overworkIsActive: notLoaded
});

GameConfig.fromConfig = ({ AMOUNT_OF_CARDS_IN_START_HAND, OVERWORK_IS_ACTIVE } = {}) => {
    return GameConfig({
        amountOfCardsInStartHand: AMOUNT_OF_CARDS_IN_START_HAND,
        overworkIsActive: OVERWORK_IS_ACTIVE
    });
};

function GameConfig({
    amountOfCardsInStartHand = DEFAULT_CONFIG.AMOUNT_OF_CARDS_IN_START_HAND,
    overworkIsActive = DEFAULT_CONFIG.OVERWORK_IS_ACTIVE,
}) {

    return {
        entity: () => ({ amountOfCardsInStartHand, overworkIsActive }),
        amountOfCardsInStartHand: () => amountOfCardsInStartHand,
        overworkIsActive: () => overworkIsActive
    };
}

function notLoaded() {
    return {
        amountOfCardsInStartHand: 0,
        overworkIsActive: false
    };
}

module.exports = GameConfig;

