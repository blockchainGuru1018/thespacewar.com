const RepairShip = require('./RepairShip.js');

module.exports = class NewHope extends RepairShip {
    constructor(deps) {
        super({
            ...deps,
            repairCapability: 5
        });
    }

    static get CommonId() {
        return '30';
    }
};