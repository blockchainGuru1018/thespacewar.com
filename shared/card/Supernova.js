const BaseCard = require("./BaseCard.js");
const Avoid = require("./Avoid.js");

class Supernova extends BaseCard {
  constructor(deps) {
    super(deps);
  }

  static get StationCardDestroyed() {
    return 3;
  }

  static get CommonId() {
    return "15";
  }

  canBePlayed() {
    return (
      super.canBePlayed() && this._hasMoreStationCardsThanSupernovaDestroys()
    );
  }

  _hasMoreStationCardsThanSupernovaDestroys() {
    return (
      this._playerStateService.getUnflippedStationCards().length >
      Supernova.StationCardDestroyed
    );
  }

  _someCardIsPreventingThisCardToBePlayed() {
    return this._queryBoard.opponentHasCardInPlay(
      (card) => card.commonId === Avoid.CommonId
    );
  }
}

module.exports = Supernova;
