const phases = require('../phases.js');

class BaseCard {

    constructor({
        card,
        playerId,
        matchInfoRepository,
        queryEvents,
        matchService,
        playerStateService,
        canThePlayer
    }) {
        this.playerId = playerId;

        this._card = { ...card };
        this._matchInfoRepository = matchInfoRepository;
        this._queryEvents = queryEvents;
        this._matchService = matchService; // TODO remove similar assignments in subclasses
        this._playerStateService = playerStateService;
        this._canThePlayer = canThePlayer;
    }

    get id() {
        return this._card.id;
    }

    get commonId() {
        return this._card.commonId;
    }

    get name() {
        return this._card.name;
    }

    get type() {
        return this._card.type;
    }

    get attack() {
        const boost = this._playerStateService.getAttackBoostForCard(this);
        return this._card.attack + boost;
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

    get numberOfAttacksPerTurn() {
        return 1;
    }

    getCardData() {
        return { ...this._card };
    }

    shallowCopyCardData() {
        return { ...this._card };
    }

    canAttack() {
        if (this.paralyzed) return false;
        if (!this.attack && !this.hasSpecialAttackForCardsInZones()) return false;
        if (!this._canThePlayer.attackWithThisCard(this)) return false;

        if (this.type === 'duration') return false;
        const isAttackPhase = this._playerStateService.getPhase() === phases.PHASES.attack
        if (!isAttackPhase) return false;

        const turn = this._matchService.getTurn();
        const attacksOnTurn = this._queryEvents.getAttacksOnTurn(this.id, turn).length;
        if (attacksOnTurn >= this.numberOfAttacksPerTurn) return false;
        if (!this.canMoveAndAttackOnSameTurn() && this._hasMovedThisTurn()) return false;

        return true;
    }

    canAttackStationCards() {
        if (!this.canAttack()) return false;
        if (!this.attack) return false;

        const turn = this._matchService.getTurn();
        const isInHomeZone = this.isInHomeZone();
        const isMissile = this.type === 'missile';
        const canAttackFromHomeZone = (isInHomeZone && this.canAttackCardsInOtherZone());
        const hasMovedOnPreviousTurn = this._queryEvents.hasMovedOnPreviousTurn(this.id, turn);
        const hasWaitedAndCanAttackFromOpponentZone = (hasMovedOnPreviousTurn && !isInHomeZone);
        const isMissileAndCanAttackFromOpponentZone = (isMissile && !isInHomeZone);

        return canAttackFromHomeZone
            || hasWaitedAndCanAttackFromOpponentZone
            || isMissileAndCanAttackFromOpponentZone;
    }

    canAttackCard(otherCard) { //TODO rename "canTargetCardForAttack", also perhaps this belongs in a more higher level class?
        if (!this.canTargetCard(otherCard)) return false;
        if (!this.canAttack()) return false;

        return this.canAttackCardsInOtherZone()
            || this._matchService.cardsAreInSameZone(this, otherCard);
    }

    canTargetCardForSacrifice(otherCard) {
        if (!this.canBeSacrificed()) return false;
        if (!this.canTargetCard(otherCard)) return false;

        if (otherCard.isStationCard()) {
            return this.canTargetStationCardsForSacrifice();
        }
        else {
            return this._matchService.cardsAreInSameZone(this, otherCard);
        }
    }

    canTargetStationCardsForSacrifice() {
        return !this.isInHomeZone()
            && !this._hasMovedThisTurn();
    }

    canMove(alternativeConditions = {}) {
        if (this.type === 'defense') return false;
        if (this.type === 'duration') return false;
        if (this.paralyzed) return false;

        const phase = alternativeConditions.phase || this._playerStateService.getPhase();
        if (phase !== 'attack') return false;

        if (!this._canThePlayer.moveThisCard(this)) return false;

        if (this._hasMovedThisTurn()) return false;

        const putDownOnTurn = this._queryEvents.getTurnWhenCardWasPutDown(this.id);
        const turn = this._matchService.getTurn();
        return putDownOnTurn !== turn || this.canMoveOnTurnWhenPutDown();
    }

    canBeRepaired() {
        return !!this.damage || this.paralyzed;
    }

    canTargetCard(otherCard) {
        if (!otherCard.canBeTargeted()) return false;
        if (otherCard.type === 'duration') return false;
        if (otherCard.playerId === this.playerId) return false;
        return true;
    }

    canBeTargeted() {
        return true;
    }

    attackCard(defenderCard) {
        const defenderCurrentDamage = defenderCard.damage;
        const defenderTotalDefense = defenderCard.defense - defenderCurrentDamage;
        const cardAttack = this.attack;
        if (cardAttack >= defenderTotalDefense) {
            defenderCard.destroyed = true;
        }
        defenderCard.damage = defenderCurrentDamage + cardAttack;

        if (this.type === 'missile') {
            this.destroyed = true;
        }
    }

    canBeSacrificed() {
        return false;
    }

    canAttackCardsInOtherZone() {
        return false;
    }

    canRepair() {
        return false;
    }

    stopsStationAttack() {
        return false
    }

    canOnlyHaveOneInHomeZone() {
        return false;
    }

    isInHomeZone() {
        return this._playerStateService.isCardInHomeZone(this.id);
    }

    isStationCard() {
        return this._playerStateService.isCardStationCard(this.id);
    }

    canMoveOnTurnWhenPutDown() {
        return this._playerStateService.cardCanMoveOnTurnWhenPutDown(this);
    }

    hasSpecialAttackForCardsInZones() {
        return false;
    }

    canMoveAndAttackOnSameTurn() {
        return true;
    }

    _hasMovedThisTurn() {
        let currentTurn = this._matchService.getTurn();
        return this._queryEvents.hasMovedOnTurn(this.id, currentTurn);
    }
}

module.exports = BaseCard;