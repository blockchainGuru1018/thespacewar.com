const CardAttackStationCardCapability = require('./CardAttackStationCardCapability.js');
const CardAttackInHomeZoneCapability = require('./CardAttackInHomeZoneCapability.js');

module.exports = function ({
    playerServiceFactory,
    matchController,
    opponentId
}) {
    return {
        attackStationCard,
        attackInHomeZone,
    };

    function attackStationCard(card) {
        return CardAttackStationCardCapability({
            card,
            matchController,
            opponentStateService: playerServiceFactory.playerStateService(opponentId),
        })
    }

    function attackInHomeZone(card) {
        return CardAttackInHomeZoneCapability({
            card,
            matchController,
            opponentStateService: playerServiceFactory.playerStateService(opponentId),
        })
    }
};
