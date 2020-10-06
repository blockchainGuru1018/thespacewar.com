const BaseCard = require("./BaseCard.js");
const _DamageToShields = 2;
module.exports = class ToxicGas extends BaseCard {
  constructor(deps) {
    super({ ...deps });
  }

  static get DamageToShields() {
    return _DamageToShields;
  }

  static get CommonId() {
    return "79";
  }

  get requirementsWhenEnterDrawPhase() {
    return {
      forOpponent: [],
      forPlayer: [
        {
          type: "damageShieldsOrStationCard",
          count: 1,
          cardCommonId: this.CommonId,
        },
      ],
    };
  }

  canAttack() {
    return false;
  }

  canFakeAttack() {
    return true;
  }

  canAttackCard(otherCard) {
    return otherCard.stopsStationAttack();
  }

  attackCard({ defenderCard }) {
    const {
      defenderDestroyed,
      defenderParalyzed,
      defenderDamage,
    } = this.simulateAttackingCard({ defenderCard });

    defenderCard.destroyed = defenderDestroyed;
    defenderCard.paralyzed = defenderParalyzed;
    defenderCard.damage = defenderDamage;
  }

  simulateAttackingCard({ defenderCard }) {
    const defenderCurrentDamage = defenderCard.damage;
    const defenderTotalDefense = defenderCard.defense - defenderCurrentDamage;
    const cardAttack = ToxicGas.DamageToShields;
    return {
      defenderDestroyed: cardAttack >= defenderTotalDefense,
      defenderDamage: defenderCurrentDamage + cardAttack,
      defenderParalyzed: false,
    };
  }
};
