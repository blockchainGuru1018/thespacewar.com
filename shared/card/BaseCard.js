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
    opponentStateService,
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
    this._opponentStateService = opponentStateService;
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

  get selfRepairAtDrawPhase() {
    return 0;
  }

  get name() {
    return this._card.name;
  }

  get type() {
    return this._card.type;
  }

  get cost() {
    throw new Error("CHANGE THIS!");
  }

  get damageGoesThroughShield() {
    return false;
  }

  get baseCost() {
    return this._card.cost;
  }

  get costToPlay() {
    return this.baseCost + this.costInflation;
  }

  get attack() {
    if (this._card.usingCollision) {
      return this.attackBoost;
    } else {
      return (this._card.attack || 0) + this.attackBoost;
    }
  }

  get baseCostIsDinamyc() {
    return false;
  }

  get attackBoost() {
    if (
      this._cardEffect.attackBoostForCollision(this._card.usingCollision) > 0
    ) {
      return this._cardEffect.attackBoostForCollision(
        this._card.usingCollision
      );
    } else {
      return this.attackBoostForCardType + this.attackBoostFromCommander;
    }
  }
  get currentHealth() {
    return this.defense - this.damage;
  }
  get attackBoostForCardType() {
    return this._cardEffect.attackBoostForCardType(this.type);
  }

  get attackBoostFromCommander() {
    return 0;
  }

  get canCollide() {
    return (
      this.type === "spaceShip" && this._cardEffect.canCollideForDurationCard()
    );
  }

  get costInflation() {
    return this._cardEffect.costCardIncrement() || 0;
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

  canDamageGoThroughShieldsDefense() {
    const totalShieldDefense = this._opponentStateService
      .getMatchingBehaviourCards((c) => c.stopsStationAttack())
      .reduce((acc, card) => acc + card.defense - card.damage, 0);

    if (totalShieldDefense > 0 && this.damageGoesThroughShield) {
      return totalShieldDefense - this.attack < 0;
    }

    return false;
  }

  canAttackStationCards() {
    //TODO Cleanup from changes to missiles, they can now "attackFromHomeZone" and should not be checked if has moved
    if (!this.canAttack()) return false;
    if (!this.attack) return false;
    if (!this._canThePlayer.attackStationCards(this)) return false;
    if (this.opponentHaveShield() && !this.canDamageGoThroughShieldsDefense())
      return false;
    const turn = this._matchService.getTurn();
    const isInHomeZone = this.isInHomeZone();
    const isMissile = this.type === "missile";

    const canAttackFromHomeZone =
      isInHomeZone && this.canAttackCardsInOtherZone();
    const hasMovedOnPreviousTurn = this._queryEvents.hasMovedOnPreviousTurn(
      this.id,
      turn
    );

    const wasGrantedByFreeEventOnPreviousTurn = this._queryEvents.wasGrantedByFreeEventOnPreviousTurnAtOpponentZone(
      this.id,
      turn
    );
    const hasWaitedAndCanAttackFromOpponentZone =
      (hasMovedOnPreviousTurn || wasGrantedByFreeEventOnPreviousTurn) &&
      !isInHomeZone;
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

  opponentHaveShield() {
    return (
      this._opponentStateService.getMatchingBehaviourCards((c) =>
        c.stopsStationAttack()
      ).length > 0
    );
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

  attackCard({ defenderCard, usingCollision = false }) {
    this._card.usingCollision = usingCollision;
    //TODO Perhaps attack logic should be in an outside class?
    const {
      attackerDestroyed,
      defenderDestroyed,
      defenderDamage,
    } = this.simulateAttackingCard({ defenderCard, usingCollision });

    defenderCard.damage = defenderDamage;
    defenderCard.destroyed = defenderDestroyed;
    this.destroyed = attackerDestroyed;
  }

  simulateAttackingCard({ defenderCard, usingCollision = false }) {
    this._card.usingCollision = usingCollision;
    return simulateAttack({ attackerCard: this, defenderCard, usingCollision });
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
      return this.costToPlay === 0;
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
