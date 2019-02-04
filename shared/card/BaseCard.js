const phases = require('../phases.js');

class BaseCard {

    constructor(deps) {
        this._card = { ...deps.card };
        this.playerId = deps.playerId;
        this._eventRepository = deps.eventRepository;
        this._matchInfoRepository = deps.matchInfoRepository;
        this._queryEvents = deps.queryEvents;
        this._matchService = deps.matchService; // TODO remove similar assignments in subclasses
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
        return this._card.attack;
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

    get numberOfAttacksPerTurn() {
        return 1;
    }

    shallowCopyCardData() {
        return { ...this._card };
    }

    canAttackStationCards() {
        if (!this.canAttack()) return false;

        const events = this._eventRepository.getAll();
        const turn = this._matchInfoRepository.getTurn();
        const isInHomeZone = this._matchService.isPlayerCardInHomeZone(this.playerId, this.id);
        const isMissile = this._card.type === 'missile'

        const canAttackFromHomeZone = (isInHomeZone && this.canAttackCardsInOtherZone());
        const hasWaitedAndCanAttackFromOpponentZone = (hasMovedOnPreviousTurn(this.id, turn, events) && !isInHomeZone);
        const isMissileAndCanAttackFromOpponentZone = (isMissile && !isInHomeZone);

        return canAttackFromHomeZone
            || hasWaitedAndCanAttackFromOpponentZone
            || isMissileAndCanAttackFromOpponentZone;
    }

    canAttack() {
        if (!this._card.attack) return false;
        if (this._card.type === 'duration') return false;
        const isAttackPhase = this._matchInfoRepository.getPlayerPhase(this.playerId) === phases.PHASES.attack
        if (!isAttackPhase) return false;

        const turn = this._matchInfoRepository.getTurn();
        const attacksOnTurn = this._queryEvents.getAttacksOnTurn(this._card.id, turn).length;
        if (attacksOnTurn >= this.numberOfAttacksPerTurn) return false;

        return true;
    }

    canAttackCard(otherCard) { //TODO rename "canTargetCardForAttack", also perhaps this belongs in a more higher level class?
        if (!this._canTargetCard(otherCard)) return false;
        if (!this.canAttack()) return false;

        return this.canAttackCardsInOtherZone()
            || this._matchService.cardsAreInSameZone(this, otherCard);
    }

    canAttackCardsInOtherZone() {
        return false;
    }

    canBeSacrificed() {
        return false;
    }

    canTargetCardForSacrifice(otherCard) {
        return this._canTargetCard(otherCard)
            && this._matchService.cardsAreInSameZone(this, otherCard);
    }

    _canTargetCard(otherCard) {
        if (!otherCard.canBeTargeted()) return false;
        if (otherCard.type === 'duration') return false;
        if (otherCard.playerId === this.playerId) return false;
        return true;
    }

    isInHomeZone() {
        return this._matchService.isPlayerCardInHomeZone(this.playerId, this.id);
    }

    attackCard(defenderCard) {
        const defenderCurrentDamage = defenderCard.damage;
        const defenderTotalDefense = defenderCard.defense - defenderCurrentDamage;
        if (this._card.attack >= defenderTotalDefense) {
            defenderCard.destroyed = true;
        }
        defenderCard.damage = defenderCurrentDamage + this._card.attack;

        if (this._card.type === 'missile') {
            this._card.destroyed = true;
        }
    }

    canMove(alternativeConditions = {}) {
        if (this._card.type === 'defense') return false;
        if (this._card.type === 'duration') return false;
        const phase = alternativeConditions.phase || this._matchInfoRepository.getPlayerPhase(this.playerId);
        if (phase !== 'attack') return false;

        if (this.hasMovedThisTurn()) return false;

        const putDownOnTurn = getTurnWhenWasPutDown(this._eventRepository.getAll(), this._card.id);
        const turn = this._matchInfoRepository.getTurn();
        return putDownOnTurn !== turn;
    }

    hasMovedThisTurn() {
        const turn = this._matchInfoRepository.getTurn();
        const movesOnTurn = this._queryEvents.getMovesOnTurn(this._card.id, turn);
        return movesOnTurn.length > 0;
    }

    canRepair() {
        return false;
    }

    canBeRepaired() {
        return !!this.damage;
    }

    stopsStationAttack() {
        return false
    }

    canOnlyHaveOneInHomeZone() {
        return false;
    }

    canBeTargeted() {
        return true;
    }
}

module.exports = BaseCard;

function getTurnWhenWasPutDown(events, cardId) {
    const putDownEventForThisCard = events.find(e => {
        return e.type === 'putDownCard'
            && e.cardId === cardId;
    });
    if (!putDownEventForThisCard) throw new Error(`Asking when card (${cardId}) was put down. But card has not been put down.`);
    return putDownEventForThisCard.turn;
}

function hasMovedOnPreviousTurn(cardId, currentTurn, events) {
    return cardHasMoved(cardId, events) && turnCountSinceMoveLast(cardId, currentTurn, events) > 0;
}

function cardHasMoved(cardId, events) {
    return events.some(e => e.type === 'moveCard' && e.cardId === cardId);
}

function turnCountSinceMoveLast(cardId, currentTurn, events) {
    const moveCardEvent = events.reverse().find(e => e.type === 'moveCard' && e.cardId === cardId);
    return currentTurn - moveCardEvent.turn;
}