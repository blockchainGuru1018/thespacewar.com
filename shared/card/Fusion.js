const BaseCard = require("./BaseCard.js");
module.exports = class Fusion extends BaseCard {
  constructor(deps) {
    super(deps);
  }

  static get CommonId() {
    return "88";
  }

  canTriggerDormantEffect() {
    const turnCardWasPutDown = this._queryEvents.getTimeWhenCardWasPutDownById(
      this.id
    );
    const currentTurn = this._matchService.getTurn();
    const itsNotSameTurnWhenWasPuttedDown = turnCardWasPutDown < currentTurn;
    const haveNotAttackedThisTurn = !this._hasAttackedThisTurn();
    const existTwoOrMoreSpaceShipsInSameZone = this._playerStateService.hasMatchingCardInSomeZone(
      this.id,
      (card) => card.type === "spaceShip"
    );

    return (
      existTwoOrMoreSpaceShipsInSameZone &&
      itsNotSameTurnWhenWasPuttedDown &&
      haveNotAttackedThisTurn
    );
  }
};
