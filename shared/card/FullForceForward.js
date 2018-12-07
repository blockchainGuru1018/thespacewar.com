const BaseCard = require('./BaseCard.js');
const CanMoveFirstTurn = require('./mixins/CanMoveFirstTurn.js');

module.exports = class FullForceForward extends CanMoveFirstTurn(BaseCard) {
    constructor(deps) {
        super(deps);
    }
};