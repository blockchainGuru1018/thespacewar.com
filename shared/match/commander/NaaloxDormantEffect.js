const Commander = require("../commander/Commander.js");
const Drone = require("../../../shared/card/Drone");

const dormantEffectSpec = {
  dormantEffectRequirementSpec: {
    draw: {
      forOpponent: [],
      forPlayer: [
        {
          type: "findCard",
          count: 1,
          sources: ["discardPile"],
          target: "zone",
          filter: {
            commonId: Drone.CommonId,
          },
        },
      ],
    },
    destroy: {
      forOpponent: [],
      forPlayer: [
        {
          type: "findCard",
          count: 1,
          sources: ["opponentCardsInZone"],
          target: "opponentDiscardPile",
          filter: {
            type: "duration",
          },
        },
      ],
    },
  },
  choicesWhenPutDownInHomeZone: [
    {
      name: "repairStation",
      text: "Repair one station card",
    },
    {
      name: "draw",
      text: `Draw 1 Drone from you discard pile`,
    },
  ],
};

class NaaloxDormantEffect {
  constructor({
    playerStateService,
    playerActionPointsCalculator,
    playerRequirementFactory,
    playerPhase,
    matchService,
    opponentActionLog,
    playerActionLog,
  }) {
    this._playerStateService = playerStateService;
    this._playerActionPointsCalculator = playerActionPointsCalculator;
    this._playerRequirementFactory = playerRequirementFactory;
    this._matchService = matchService;
    this._opponentActionLog = opponentActionLog;
    this._playerPhase = playerPhase;
    this._playerActionLog = playerActionLog;
  }

  static get Cost() {
    return 2;
  }

  static get MaxUsePerTurn() {
    return 2;
  }

  canIssueReviveDrone() {
    return (
      this._thereAreDronesInTheDiscardPile() && this._meetCommonRequirements()
    );
  }

  canIssueRepairStation() {
    return (
      this._thereAreFlippedStationCards() && this._meetCommonRequirements()
    );
  }

  naaloxReviveDrone() {
    console.log("revive drones");
    const droneCardsFromDiscardPile = this._playerStateService
      .getDiscardedCards()
      .filter((card) => card.commonId === Drone.CommonId);
    if (droneCardsFromDiscardPile.length > 0) {
      const droneCard = droneCardsFromDiscardPile[0];
      this._playerStateService.removeCardFromDiscardPile(droneCard.id);

      this._playerStateService.putDownCardInZone(droneCard, {
        grantedForFreeByEvent: true,
      });
      this._opponentActionLog.opponentIssuedNaaloxReviveDrone(Drone.CommonId);
      this._playerActionLog.receivedCardFromCommander(Drone.CommonId);
      this._createAndStoreEvent();
    }
  }

  naaloxRepairStationCard() {
    console.log("repair station card ");
    this._opponentActionLog.opponentIssuedNaaloxRepairStation();
    this._createAndStoreEvent();
  }

  _meetCommonRequirements() {
    return (
      this._playerPhase.isAction() &&
      this._isUsingNaaloxCommander() &&
      this._canAffordTriggerDormantEffect() &&
      this._hasNotBeenUsedTwiceThisTurn()
    );
  }

  _thereAreDronesInTheDiscardPile() {
    return this._playerStateService
      .getDiscardedCards()
      .some((card) => card.commonId === Drone.CommonId);
  }

  _thereAreFlippedStationCards() {
    return this._playerStateService.getFlippedStationCards().length > 0;
  }

  _isUsingNaaloxCommander() {
    return this._playerStateService.getCurrentCommander() === Commander.Naalox;
  }

  _canAffordTriggerDormantEffect() {
    return this._playerActionPointsCalculator.calculate() >= NaaloxDormantEffect.Cost;
  }

  _hasNotBeenUsedTwiceThisTurn() {
    const currentTurn = this._matchService.getTurn();
    return !(
      this._playerStateService
        .getEvents()
        .filter(
          (event) =>
            event.type === "naaloxDormantEffect" && event.turn === currentTurn
        ).length >= NaaloxDormantEffect.MaxUsePerTurn
    );
  }

  _createAndStoreEvent() {
    const turn = this._matchService.getTurn();
    const event = { turn, type: "naaloxDormantEffect" };
    this._playerStateService.storeEvent(event);
  }
}

module.exports = NaaloxDormantEffect;
