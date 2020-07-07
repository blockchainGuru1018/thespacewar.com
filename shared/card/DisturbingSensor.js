const BaseCard = require("./BaseCard.js");
const PreventsOpponentMissilesFromAttacking = require("./mixins/PreventsOpponentMissilesFromAttacking.js");
const PreventsOpponentMissilesFromMoving = require("./mixins/PreventsOpponentMissilesFromMoving.js");
module.exports = class DisturbingSensor extends PreventsOpponentMissilesFromAttacking(
    PreventsOpponentMissilesFromMoving(BaseCard)
) {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return "37";
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
            forOpponent: [{ type: "discardCard", count: 1, cardCommonId }],
            forPlayer: [],
        };
    }
};
