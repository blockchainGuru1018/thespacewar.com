const simulateAttack = require("./simulateAttack.js");
const phases = require("../phases.js");

class BaseCard {
  constructor({
    card,
    playerId,
    matchInfoRepository,
    queryEvents,
    matchService,
    playerStateService,
    canThePlayer,
    playerRuleService,
    turnControl,
    cardEffect,
    playerPhase,
    addRequirementFromSpec,
    queryBoard,
    alternativeConditions = {},
  }) {
    this.playerId = playerId;

    this._card = { ...card };
    this._matchInfoRepository = matchInfoRepository;
    this._queryEvents = queryEvents;
    this._matchService = matchService;
    this._playerStateService = playerStateService;
    this._canThePlayer = canThePlayer;
    this._playerRuleService = playerRuleService;
    this._turnControl = turnControl;
    this._cardEffect = cardEffect;
    this._playerPhase = playerPhase;
    this._addRequirementFromSpec = addRequirementFromSpec;
    this._queryBoard = queryBoard;
    this._alternativeConditions = alternativeConditions;
  }

  get id() {
    return this._card.id;
  }

  get commonId() {
    return this._card.commonId;
  }

  get CommonId() {
    return this.constructor.CommonId;
  }

  get name() {
    return this._card.name;
  }

  get type() {
    return this._card.type;
  }

  get cost() {
    return this._card.cost;
  }

  get attack() {
    return this._card.attack + this.attackBoost;
  }

  get attackBoost() {
    return this._cardEffect.attackBoostForCardType(this.type);
  }

  get defense() {
    return this._card.defense;
  }

  get destroyed() {
    return this._card.destroyed;
  }

  set destroyed(wasDestroyed) {
    this._card.destroyed = wasDestroyed;
  }

  get damage() {
    return this._card.damage || 0;
  }

  set damage(newDamage) {
    this._card.damage = newDamage;
  }

  get paralyzed() {
    return this._card.paralyzed;
  }

  set paralyzed(isParalyzed) {
    this._card.paralyzed = isParalyzed;
  }

  get flipped() {
    return this._card.flipped;
  }

  set flipped(isFlipped) {
    this._card.flipped = isFlipped;
  }

  get numberOfAttacksPerTurn() {
    return 1;
  }

  getCardData() {
    const { flipped, ...cardData } = this._card;
    return { ...cardData };
  }

  canAttack() {
    if (this.paralyzed) return false;
    if (!this.attack && !this.hasSpecialAttackForCardsInZones()) return false;
    if (!this._canThePlayer.attackWithThisCard(this)) return false;
    if (this.type === "duration") return false;
    const isAttackPhase = this._getCurrentPhase() === phases.PHASES.attack;
    if (!isAttackPhase) return false;

    const turn = this._matchService.getTurn();
    const attacksOnTurn = this._queryEvents.getAttacksOnTurn(this.id, turn)
      .length;
    if (attacksOnTurn >= this.numberOfAttacksPerTurn) return false;
    if (!this.canMoveAndAttackOnSameTurn() && this._hasMovedThisTurn())
      return false;

    return true;
  }

  canAttackStationCards() {
    //TODO Cleanup from changes to missiles, they can now "attackFromHomeZone" and should not be checked if has moved
    if (!this.canAttack()) return false;
    if (!this.attack) return false;
    if (!this._canThePlayer.attackStationCards()) return false;
    const turn = this._matchService.getTurn();
    const isInHomeZone = this.isInHomeZone();
    const isMissile = this.type === "missile";

    const canAttackFromHomeZone =
      isInHomeZone && this.canAttackCardsInOtherZone();
    const hasMovedOnPreviousTurn = this._queryEvents.hasMovedOnPreviousTurn(
      this.id,
      turn
    );
    const hasWaitedAndCanAttackFromOpponentZone =
      hasMovedOnPreviousTurn && !isInHomeZone;
    const isMissileAndCanAttackFromOpponentZone = isMissile && !isInHomeZone;

    return (
      canAttackFromHomeZone ||
      hasWaitedAndCanAttackFromOpponentZone ||
      isMissileAndCanAttackFromOpponentZone
    );
  }

  canAttackCard(otherCard) {
    //TODO rename "canTargetCardForAttack", also perhaps this belongs in a more higher level class?
    return this.canTargetCard(otherCard) && this.canAttack();
  }

  canTargetCardForSacrifice(otherCard) {
    return false;
  }

  canTargetStationCardsForSacrifice() {
    return false;
  }

  canBeUsed() {
    return this._canThePlayer.useThisCard(this);
  }

  canMove() {
    if (this.type === "defense") return false;
    if (this.type === "duration") return false;
    if (this.paralyzed) return false;

    if (this._getCurrentPhase() !== "attack") return false;
    if (!this._canThePlayer.moveThisCard(this)) return false;

    if (this._hasMovedThisTurn()) return false;
    if (!this.canMoveAndAttackOnSameTurn() && this._hasAttackedThisTurn())
      return false;

    const putDownOnTurn = this._queryEvents.getTurnWhenCardWasPutDown(this.id);
    const turn = this._matchService.getTurn();
    return putDownOnTurn !== turn || this.canMoveOnTurnWhenPutDown();
  }

  canBeRepaired() {
    if (this.isStationCard()) {
      return this.isFlipped();
    } else {
      return !!this.damage || this.paralyzed;
    }
  }

  canTargetCard(otherCard) {
    if (!otherCard.canBeTargeted()) return false;
    if (otherCard.type === "duration") return false;
    if (otherCard.playerId === this.playerId) return false;

    return (
      this.canAttackCardsInOtherZone() ||
      this._matchService.cardsAreInSameZone(this, otherCard)
    );
  }

  canBeTargeted() {
    return true;
  }

  attackCard(defenderCard) {
    //TODO Perhaps attack logic should be in an outside class?
    const {
      attackerDestroyed,
      defenderDestroyed,
      defenderDamage,
    } = this.simulateAttackingCard(defenderCard);

    defenderCard.damage = defenderDamage;
    defenderCard.destroyed = defenderDestroyed;
    this.destroyed = attackerDestroyed;
  }

  simulateAttackingCard(defenderCard) {
    return simulateAttack(this, defenderCard);
  }

  canBeSacrificed() {
    return false;
  }

  canAttackCardsInOtherZone() {
    if (this.type === "missile") {
      return this.canMove() && this.canMoveAndAttackOnSameTurn();
    }
    return false;
  }

  canRepair() {
    return false;
  }

  stopsStationAttack() {
    return false;
  }

  canOnlyHaveOneInHomeZone() {
    return false;
  }

  isInHomeZone() {
    return (
      this.isStationCard() || this._playerStateService.isCardInHomeZone(this.id)
    );
  }

  isFlippedStationCard() {
    return this.isStationCard() && this.isFlipped();
  }

  isStationCard() {
    return this._playerStateService.isCardStationCard(this.id);
  }

  isFlipped() {
    return this._playerStateService.isCardFlipped(this.id);
  }

  canMoveOnTurnWhenPutDown() {
    return this._cardEffect.cardTypeCanMoveOnTurnPutDown(this.type);
  }

  hasSpecialAttackForCardsInZones() {
    return false;
  }

  canMoveAndAttackOnSameTurn() {
    return true;
  }

  canCounterCard() {
    return false;
  }

  canTriggerDormantEffect() {
    return false;
  }

  canBePutDownAnyTime() {
    return false;
  }

  //TODO: better name to find out that this is the last card of same kind played
  isTheLatestPlayedCardOfSameKind() {
    const turnWhenOpponentCardWasPutDown = this._queryEvents.getTimeWhenOpponentCardWasPutDownByCommonId(
      this.commonId
    );
    const turnCardWasPutDown = this._queryEvents.getTimeWhenCardWasPutDownById(
      this.id
    );
    return turnWhenOpponentCardWasPutDown
      ? turnWhenOpponentCardWasPutDown < turnCardWasPutDown
      : true;
  }

  canBePlayed() {
    return (
      this._canGenerallyPlayCardsOrCanAlwaysPlayCard() &&
      this._ifHasControlOfOpponentTurnCanPlayCard() &&
      this._isEventCardAndCanPlayEventCards() &&
      this._canThePlayer.affordCard(this) &&
      !this._wouldOverstepMaxInPlayLimit() &&
      this._canBePlayedInThisPhase() &&
      !this._someCardIsPreventingThisCardToBePlayed()
    );
  }

  _canBePlayedInThisPhase() {
    return true;
  }

  _someCardIsPreventingThisCardToBePlayed() {
    return false;
  }

  isOpponentCard(otherPlayerId) {
    return this.playerId !== otherPlayerId;
  }

  _canGenerallyPlayCardsOrCanAlwaysPlayCard() {
    return (
      this._playerRuleService.canPutDownCardsInHomeZone() ||
      this.canBePutDownAnyTime()
    );
  }

  _ifHasControlOfOpponentTurnCanPlayCard() {
    if (this._turnControl.playerHasControlOfOpponentsTurn()) {
      return this.cost === 0;
    }
    return true;
  }

  _isEventCardAndCanPlayEventCards() {
    if (this.type === "event") {
      return this._playerRuleService.canPutDownEventCards();
    }
    return true;
  }

  _wouldOverstepMaxInPlayLimit() {
    if (this.canOnlyHaveOneInHomeZone()) {
      return this._playerStateService.hasCardOfTypeInZone(this.CommonId);
    }

    return false;
  }

  get eventSpecsWhenPutDownInHomeZone() {
    return [];
  }

  _hasMovedThisTurn() {
    const currentTurn = this._matchService.getTurn();
    return this._queryEvents.hasMovedOnTurn(this.id, currentTurn);
  }

  _hasAttackedThisTurn() {
    const currentTurn = this._matchService.getTurn();
    const attacksOnTurn = this._queryEvents.getAttacksOnTurn(
      this.id,
      currentTurn
    ).length;
    return attacksOnTurn > 0;
  }

  _getCurrentPhase() {
    return (
      this._alternativeConditions.phase || this._playerStateService.getPhase()
    );
  }
}

module.exports = BaseCard;
