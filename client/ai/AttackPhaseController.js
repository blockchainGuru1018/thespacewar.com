//Simple card = Missile or Space ships

module.exports = function ({
    matchController,
    utils,
    playerStateService,
    opponentStateService,
    homeZoneAttacker,
    opponentStationAttacker,
    opponentZoneAttacker,
    mover
}) {

    return {
        onAttackPhase
    };

    function onAttackPhase() {
        if (homeZoneAttacker.canAttackSomeCardInHomeZone()) {
            homeZoneAttacker.attackFirstAvailableTargetInHomeZone();
        }
        else if (opponentStationAttacker.canAttackOpponentStation()) {
            opponentStationAttacker.attackOpponentStation();
        }
        else if (mover.canMoveSomeCardInHomeZone()) {
            mover.moveFirstAvailableCardFromHomeZone();
        }
        else if (opponentZoneAttacker.canAttackSomeCardInOpponentZone()) {
            opponentZoneAttacker.attackFirstAvailableTargetInOpponentZone();
        }
    }
};

