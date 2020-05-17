const RepairShip = require('./RepairShip.js');
const CanMoveFirstTurn = require('./mixins/CanMoveFirstTurn.js');

module.exports = class SmallRepairShop extends CanMoveFirstTurn(RepairShip) {
    constructor(deps) {
        super({
            ...deps,
            repairCapability: 3
        });
    }

    static get CommonId() {
        return '90';
    }
};
/*
{

    "id": "90",
    "name": "Repair Ship",
    "price": "1",
    "type_card": "blue",
    "detail": "Can repair 3 damage to spaceship or 1 damage to station.",
    "defense": "2",
    "attack": "0",
    "number_copies": "2",
    "author": "",
    "deck": "2"

}

---------------------------------------------------------
{

    "id": "29",
    "name": "Small Repair Ship",
    "price": "2",
    "type_card": "blue",
    "detail": "Can instead of doing attack repair 1 station damage or 3 other damage.\r\nFast (can move the first turn).",
    "defense": "3",
    "attack": "1",
    "number_copies": "1",
    "author": "Luca Oleastri",
    "deck": "1"

}

 */