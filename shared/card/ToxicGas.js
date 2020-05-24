const BaseCard = require('./BaseCard.js');
const CanMoveFirstTurn = require('./mixins/CanMoveFirstTurn.js');

module.exports = class ToxicGas extends CanMoveFirstTurn(BaseCard) {
    constructor(deps) {
        super({...deps});
    }

    static get CommonId() {
        return '79';
    }
};
