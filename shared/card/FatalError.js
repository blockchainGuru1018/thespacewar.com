const info = require("./info/38.config.js");
const BaseCard = require("./BaseCard.js");
const FatalErrorDestroyCardAction = require("./fatalError/FatalErrorDestroyCardAction.js");
const FatalErrorUsedEvent = require("../event/FatalErrorUsedEvent.js");

module.exports = class FatalError extends BaseCard {
  constructor(deps) {
    super(deps);
  }

  static get Info() {
    return info;
  }

  static get CommonId() {
    return info.CommonId;
  }

  get actionWhenPutDownInHomeZone() {
    return new FatalErrorDestroyCardAction({ playerId: this.playerId });
  }

  useAgainst(targetCard) {
    this._card.cost = targetCard.baseCost;
    this._playerStateService.putDownEventCardInZone(this.getCardData());
    this._playerStateService.storeEvent(
      FatalErrorUsedEvent({
        turn: this._matchService.getTurn(),
        phase: this._playerPhase.get(),
        targetCardCommonId: targetCard.commonId,
        targetCardCost: targetCard.costToPlay,
        cardId: this.id,
      })
    );
  }
  get baseCostIsDinamyc() {
    return true;
  }

  get baseCost() {
    const costForCounter = this._queryEvents.costOfFatalErrorUsed(this.id);
    return costForCounter ? costForCounter.targetCardCost : this._card.cost;
  }

  _canBePlayedInThisPhase() {
    return this._playerPhase.isAction();
  }
};
