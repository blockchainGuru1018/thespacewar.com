const BaseCard = require("./BaseCard.js");
const AllowsFriendlySpaceShipsToMoveTurnWhenPutDown = require("./mixins/AllowsFriendlySpaceShipsToMoveTurnWhenPutDown.js");
const FriendlySpaceShipAttackBonus = require("./mixins/FriendlySpaceShipAttackBonus.js");

module.exports = class FullForceForward extends FriendlySpaceShipAttackBonus(1)(
    BaseCard
) {
    static get CommonId() {
        return "9";
    }
};
