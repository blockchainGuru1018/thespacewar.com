const ShouldPlayGoodKarma = require('./ShouldPlayGoodKarma.js');

module.exports = function ({
    BotId,
    playerServiceFactory
}) {

    return {
        createAll
    };

    function createAll() {
        return [
            shouldPlayGoodKarma()
        ];
    }

    function shouldPlayGoodKarma() {
        return ShouldPlayGoodKarma({
            playerStateService: playerServiceFactory.playerStateService(BotId)
        });
    }
};
