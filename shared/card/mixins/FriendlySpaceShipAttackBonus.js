module.exports = (attackBonus) => (superclass) =>
    class FriendlySpaceShipAttackBonus extends superclass {
        get friendlySpaceShipAttackBonus() {
            return attackBonus;
        }
    };
