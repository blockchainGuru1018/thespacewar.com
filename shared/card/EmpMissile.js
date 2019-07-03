const BaseCard = require('./BaseCard.js');
const EnergyShield = require('./EnergyShield.js');

module.exports = class EmpMissile extends BaseCard {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '7';
    }

    hasSpecialAttackForCardsInZones() {
        return true;
    }

    canAttackCard(otherCard) {
        if (otherCard.paralyzed) return false;
        if (!this.canTargetCard(otherCard)) return false;
        if (!this.canAttack()) return false;

        return otherCard.type === 'spaceShip' || otherCard.commonId === EnergyShield.CommonId;
    }

    attackCard(defenderCard) {
        const {
            attackerDestroyed,
            defenderParalyzed,
            defenderDestroyed
        } = this.simulateAttackingCard(defenderCard);

        defenderCard.destroyed = defenderDestroyed;
        defenderCard.paralyzed = defenderParalyzed;
        this.destroyed = attackerDestroyed;
    }

    simulateAttackingCard(defenderCard) {
        const defenderIsEnergyShield = defenderCard.commonId === EnergyShield.CommonId;
        return {
            attackerDestroyed: true,
            defenderDestroyed: defenderIsEnergyShield,
            defenderParalyzed: defenderCard.type === 'spaceShip' && !defenderIsEnergyShield
        };
    }
};
