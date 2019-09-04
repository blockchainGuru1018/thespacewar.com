const BotSpawner = require('./BotSpawner.js');

module.exports = function ({
    clientState,
    matchController,
    rawCardDataRepository,
    userRepository,
    gameConfig,
}) {
    clientState.onUpdate(() => {
        const botSpawner = BotSpawner({
            clientState,
            matchController,
            rawCardDataRepository,
            userRepository,
            gameConfig
        });
        botSpawner.spawn();
    });
};
