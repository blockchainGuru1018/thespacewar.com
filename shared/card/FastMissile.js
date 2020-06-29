const BaseCard = require('./BaseCard.js');
const CanMoveFirstTurn = require('./mixins/CanMoveFirstTurn.js');

module.exports = class FastMissile extends CanMoveFirstTurn(BaseCard) {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '6';
    }
};
