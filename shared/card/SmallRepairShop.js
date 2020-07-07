const RepairShip = require("./RepairShip.js");
const CanMoveFirstTurn = require("./mixins/CanMoveFirstTurn.js");

module.exports = class SmallRepairShop extends CanMoveFirstTurn(RepairShip) {
    constructor(deps) {
        super({
            ...deps,
            repairCapability: 3,
        });
    }

    static get CommonId() {
        return "29";
    }
};
