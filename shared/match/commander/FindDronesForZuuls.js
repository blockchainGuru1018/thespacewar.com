const Commander = require("../commander/Commander.js");
const Drone = require("../../../shared/card/Drone");
class FindDronesForZuuls {
  constructor({
    playerStateService,
    playerPhase,
    opponentActionLog,
    matchService,
    playerActionLog,
  }) {
    this._playerStateService = playerStateService;
    this._playerPhase = playerPhase;
    this._opponentActionLog = opponentActionLog;
    this._matchService = matchService;
    this._playerActionLog = playerActionLog;
  }

  canIssueFindDronesForZuuls() {
    return (
      this._itsFirstTurn() &&
      this._playerPhase.isAction() &&
      this._isUsingZuulsCommander() &&
      this._hasNotIssuedFindDronesInThisMatch()
    );
  }
  _hasNotIssuedFindDronesInThisMatch() {
    return (
      this._playerStateService
        .getEvents()
        .filter((e) => e.type === "zuulsFindDrones").length === 0
    );
  }
  _isUsingZuulsCommander() {
    return this._playerStateService.getCurrentCommander() === Commander.Zuuls;
  }

  _itsFirstTurn() {
    return this._matchService.getTurn() === 1;
  }

  _createAndStoreEvent() {
    const turn = this._matchService.getTurn();
    const event = { turn, type: "zuulsFindDrones" };
    this._playerStateService.storeEvent(event);
  }

  _addDroneCardFromDeck() {
    let droneCard;
    this._playerStateService.useDeck((deck) => {
      droneCard = deck.removeFirstCardOfType(Drone.CommonId);
    });
    if (droneCard) {
      this._playerStateService.putDownCardInZone(droneCard, {
        grantedForFreeByEvent: true,
      });

      this._opponentActionLog.opponentReceivedCardFromCommander(Drone.CommonId);
      this._playerActionLog.receivedCardFromCommander(Drone.CommonId);
    }
  }
  findDronesForZuuls() {
    for (let cardCount = 0; cardCount < 3; cardCount++) {
      this._addDroneCardFromDeck();
    }
  }
}

module.exports = FindDronesForZuuls;
