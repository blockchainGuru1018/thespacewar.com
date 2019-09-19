const CardAttackStationCardCapability = require('./CardAttackStationCardCapability.js');
const CardAttackInHomeZoneCapability = require('./CardAttackInHomeZoneCapability.js');
const CardMoveCapability = require('./CardMoveCapability.js');

module.exports = function ({
    playerServiceFactory,
    matchController,
    opponentId
}) {
    return {
        attackStationCard,
        attackInHomeZone,
        move,
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

    function move(card) {
        return CardMoveCapability({
            card,
            matchController,
            opponentStateService: playerServiceFactory.playerStateService(opponentId),
        })
    }
};
