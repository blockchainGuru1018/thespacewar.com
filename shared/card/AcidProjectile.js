const BaseCard = require('./BaseCard.js');

const CanMoveFirstTurn = require('./mixins/CanMoveFirstTurn');

module.exports = class AcidProjectile extends CanMoveFirstTurn(BaseCard) {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '84';
    }

};
