const CardAttackStationCardCapability = require('./CardAttackStationCardCapability.js');
const CardAttackEnergyShieldCapability = require('./CardAttackEnergyShieldCapability.js');
const CardAttackInHomeZoneCapability = require('./CardAttackInHomeZoneCapability.js');
const CardMoveCapability = require('./CardMoveCapability.js');

module.exports = function ({
    playerServiceFactory,
    matchController,
    opponentId
}) {
    return {
        attackStationCard,
        attackEnergyShield,
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

    function attackEnergyShield(card) {
        return CardAttackEnergyShieldCapability({
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
