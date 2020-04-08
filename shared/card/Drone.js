const info = require('./info/78.config.js');
const BaseCard = require('./BaseCard.js');

const CanMoveFirstTurn = require('./mixins/CanMoveFirstTurn');

module.exports = class Drone extends CanMoveFirstTurn(BaseCard) {
    constructor(deps) {
        super(deps);
    }

    static get Info() {
        return info;
    }

    static get CommonId() {
        return info.CommonId;
    }


};
