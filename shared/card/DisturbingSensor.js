const BaseCard = require('./BaseCard.js');

module.exports = class DisturbingSensor extends BaseCard {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '37';
    }

    get preventsOpponentMissilesFromMoving() {
        return true;
    }

    get preventsOpponentMissilesFromAttacking() {
        return true;
    }

    canAttack() {
        return false;
    }

    get requirementsWhenOpponentLeaveDrawPhase() {
        const cardCommonId = this.commonId;
        return {
            shouldApply({ opponentStateService }) {
                return opponentStateService.getCardsOnHandCount() > 1;
            },
            forOpponent: [
                { type: 'discardCard', count: 1, cardCommonId }
            ],
            forPlayer: []
        }
    }
};
