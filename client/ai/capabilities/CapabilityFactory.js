const AttackStationCardCapability = require('./AttackStationCardCapability.js');
const AttackEnergyShieldCardCapability = require('./AttackEnergyShieldCardCapability.js');
const AttackInHomeZoneCardCapability = require('./AttackInHomeZoneCardCapability.js');
const MoveCardCapability = require('./MoveCardCapability.js');

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
        return AttackStationCardCapability({
            card,
            matchController,
            opponentStateService: playerServiceFactory.playerStateService(opponentId),
        })
    }

    function attackEnergyShield(card) {
        return AttackEnergyShieldCardCapability({
            card,
            matchController,
            opponentStateService: playerServiceFactory.playerStateService(opponentId),
        })
    }

    function attackInHomeZone(card) {
        return AttackInHomeZoneCardCapability({
            card,
            matchController,
            opponentStateService: playerServiceFactory.playerStateService(opponentId),
        })
    }

    function move(card) {
        return MoveCardCapability({
            card,
            matchController,
            opponentStateService: playerServiceFactory.playerStateService(opponentId),
        })
    }
};
