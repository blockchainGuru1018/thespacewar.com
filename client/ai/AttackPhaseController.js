const HomeZoneAttacker = require('./HomeZoneAttacker.js');
const OpponentZoneAttacker = require('./OpponentZoneAttacker.js');
const OpponentStationAttacker = require('./OpponentStationAttacker.js');
const Mover = require('./Mover.js');

//Simple card = Missile or Space ships

module.exports = function ({
    matchController,
    utils,
    playerStateService,
    opponentStateService,
}) {

    return {
        onAttackPhase
    };

    function onAttackPhase() {
        //TODO MOVE TO DEPS!
        const homeZoneAttacker = HomeZoneAttacker();
        const opponentStationAttacker = OpponentStationAttacker();
        const opponentZoneAttacker = OpponentZoneAttacker();
        const mover = Mover();

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

        if(task === fun) {
            doItRightNow(task);
        }
        else if(task === tedious) {
            postPone(task);
        }


        if(task === fun) {
            doItRightNow(task);
        }
        else if(task === tedious) {
            postPone(task)
        }
    }
};

