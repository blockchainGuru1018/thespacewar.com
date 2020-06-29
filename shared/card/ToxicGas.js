const BaseCard = require('./BaseCard.js');
const CanMoveFirstTurn = require('./mixins/CanMoveFirstTurn.js');

module.exports = class ToxicGas extends CanMoveFirstTurn(BaseCard) {
    constructor(deps) {
        super({...deps});
        simulateAttack()
    }

    static get CommonId() {
        return '79';
    }

    damageWhenAttackedMultiplier() {
        return 2;
    }

    simulateAttack() {
        return this.damageWhenAttackedMultiplier() - 1;
    }
};
