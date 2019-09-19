const CardAttackStationCardCapability = require('./CardAttackStationCardCapability.js');

module.exports = function ({
    playerServiceFactory,
    matchController,
    opponentId
}) {
    return {
        attackStationCard
    };

    function attackStationCard(card) {
        return CardAttackStationCardCapability({
            card,
            matchController,
            opponentStateService: playerServiceFactory.playerStateService(opponentId),
        })
    }
};
