const BaseCard = require('./BaseCard.js');
const CanMoveFirstTurn = require('./mixins/CanMoveFirstTurn.js');

module.exports = class Hunter extends CanMoveFirstTurn(BaseCard) {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '28';
    }
};