const BaseCard = require("./BaseCard.js");
const CanMoveFirstTurn = require("./mixins/CanMoveFirstTurn.js");
const Drone = require("./Drone.js");
module.exports = class DroneLeader extends CanMoveFirstTurn(BaseCard) {
  constructor(deps) {
    super(deps);
  }

  static get CommonId() {
    return "93";
  }

  get attack() {
    return this.attackBoost;
  }
  get attackBoost() {
    return (
      this._cardEffect.attackBoostForCardType(this.type) +
      this._calculateAttackByDronesInPlay()
    );
  }

  _calculateAttackByDronesInPlay() {
    const dronesInPlay = this._playerStateService.getMatchingBehaviourCards(
      (card) => card.CommonId === Drone.CommonId
    );
    return dronesInPlay.length;
  }
};
