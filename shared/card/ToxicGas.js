const BaseCard = require('./BaseCard.js');

module.exports = class ToxicGas extends BaseCard {
    constructor(deps) {
        super({...deps});
    }

    static get CommonId() {
        return '79';
    }

    get requirementsWhenEnterDrawPhase() {
        return {
            forOpponent: [],
            forPlayer: [
                { 
                    type: 'damageShieldsOrStationCard',
                    count: 1, 
                    cardCommonId: 79
                }
            ]
        }
    }
    canAttack(){
        return true;
    }
    canAttackCard(otherCard) {
        return otherCard.type === 'defense';
    }

    attackCard(defenderCard) {
        const {
            defenderDestroyed,
            defenderParalyzed
        } = this.simulateAttackingCard(defenderCard);

        defenderCard.destroyed = defenderDestroyed;
        defenderCard.paralyzed = defenderParalyzed;
        defenderCard.damage = 2;
    }

    simulateAttackingCard(defenderCard) {
        const defenderCurrentDamage = defenderCard.damage;
        const defenderTotalDefense = defenderCard.defense - defenderCurrentDamage;
        const cardAttack = 2;
        return {
            defenderDestroyed: cardAttack >= defenderTotalDefense,
            defenderDamage: defenderCurrentDamage + cardAttack,
            defenderParalyzed: false
        };
    }
};
