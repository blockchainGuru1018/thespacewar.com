const phases = require('../phases.js');
const QueryEvents = require('../event/QueryEvents.js');

class BaseCard {

    constructor(deps) {
        this._card = { ...deps.card };
        this._playerId = deps.playerId;
        this._eventRepository = deps.eventRepository;
        this._matchInfoRepository = deps.matchInfoRepository;

        this._queryEvents = new QueryEvents(this._eventRepository); //TODO Use QueryEvents and take it in as a dependency instead of event repository
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

    canAttackStationCards() {
        const events = this._eventRepository.getAll();
        const moveCardEvent = hasMoved(this._card.id, events);
        if (!moveCardEvent) return false;
        if (this._card.type === 'missile') return true;

        const turn = this._matchInfoRepository.getTurn();
        const didNotMoveThisTurn = turnCountSinceMove(this._card.id, turn, events) > 0
        return didNotMoveThisTurn && !this.hasAttackedThisTurn();
    }

    canAttack() {
        if (!this._card.attack) return false;
        if (this._card.type === 'duration') return false;

        return this._matchInfoRepository.getPlayerPhase(this._playerId) === phases.PHASES.attack
            && !this.hasAttackedThisTurn();
    }

    canAttackCard(otherCard) {
        if (otherCard.type === 'duration') return false;
        return true; //TODO Should this check "canAttack"? Is redundant in current uses, but it "makes sense" to do it.
    }

    hasAttackedThisTurn() {
        const turn = this._matchInfoRepository.getTurn();
        const attacksOnTurn = this._queryEvents.getAttacksOnTurn(this._card.id, turn)
        return attacksOnTurn.length > 0;
    }

    isInOpponentZone() {
        let moves = this._queryEvents.getAllMoves(this._card.id);
        return moves.length % 2 === 1;
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
        const phase = alternativeConditions.phase || this._matchInfoRepository.getPlayerPhase(this._playerId);
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

function hasMoved(cardId, events) {
    return events.some(e => e.type === 'moveCard' && e.cardId === cardId);
}

function turnCountSinceMove(cardId, currentTurn, events) {
    const moveCardEvent = events.find(e => e.type === 'moveCard' && e.cardId === cardId);
    return currentTurn - moveCardEvent.turn;
}