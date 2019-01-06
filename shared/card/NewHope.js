const RepairShip = require('./RepairShip.js');
const CanMoveFirstTurn = require('./mixins/CanMoveFirstTurn.js');

module.exports = class NewHope extends CanMoveFirstTurn(RepairShip) {
    constructor(deps) {
        super({
            ...deps,
            repairCapability: 3
        });
    }
};