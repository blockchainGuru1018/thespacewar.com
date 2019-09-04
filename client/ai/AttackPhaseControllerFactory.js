const HomeZoneAttacker = require('./HomeZoneAttacker.js');
const OpponentZoneAttacker = require('./OpponentZoneAttacker.js');
const OpponentStationAttacker = require('./OpponentStationAttacker.js');
const Mover = require('./Mover.js');
const Utils = require('./Utils.js');

module.exports = function ({
    matchController,
    utils,
    playerStateService,
    opponentStateService,
}) {

    return {
        create
    };

    function create() {
        const homeZoneAttacker = HomeZoneAttacker();
        const opponentStationAttacker = OpponentStationAttacker();
        const opponentZoneAttacker = OpponentZoneAttacker();
        const mover = Mover();
        return AttackPhaseController({
            homeZoneAttacker,
            opponentStationAttacker,
            opponentZoneAttacker,
            mover
        });
    }
};
