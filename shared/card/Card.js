module.exports = function Card(deps) {

    const eventRepository = deps.eventRepository;
    const matchInfoRepository = deps.matchInfoRepository;
    const card = { ...deps.card };

    return {
        get id() {
            return card.id;
        },
        get commonId() {
            return card.commonId;
        },
        get type() {
            return card.type;
        },
        get attack() {
            return card.attack;
        },
        get defense() {
            return card.defense;
        },
        get destroyed() {
            return !!card.destroyed;
        },
        set destroyed(wasDestroyed) {
            card.destroyed = wasDestroyed;
        },
        get damage() {
            return card.damage || 0;
        },
        set damage(newDamage) {
            card.damage = newDamage;
        },
        canAttackStationCards,
        hasAttackedThisTurn,
        isInOpponentZone,
        attackCard
    };

    function canAttackStationCards() {
        const events = eventRepository.getAll();
        const moveCardEvent = hasMoved(card.id, events);
        if (!moveCardEvent) return false;
        if (card.type === 'missile') return true;

        const turn = matchInfoRepository.getTurn();
        return turnCountSinceMove(card.id, turn, events) > 0;
    }

    function hasAttackedThisTurn() {
        const events = eventRepository.getAll();
        const turn = matchInfoRepository.getTurn();
        return events.some(event => {
            return event.turn === turn
                && event.type === 'attack'
                && event.attackerCardId === card.id
        });
    }

    function isInOpponentZone() {
        return hasMoved(card.id, eventRepository.getAll());
    }

    function attackCard(defenderCard) {
        const defenderCurrentDamage = defenderCard.damage;
        const defenderTotalDefense = defenderCard.defense - defenderCurrentDamage;
        if (card.attack >= defenderTotalDefense) {
            defenderCard.destroyed = true;
        }
        defenderCard.damage = defenderCurrentDamage + card.attack;

        if(card.type === 'missile') {
            card.destroyed = true;
        }
    }
}

function hasMoved(cardId, events) {
    return events.some(e => e.type === 'moveCard' && e.cardId === cardId);
}

function turnCountSinceMove(cardId, currentTurn, events) {
    const moveCardEvent = events.find(e => e.type === 'moveCard' && e.cardId === cardId);
    return currentTurn - moveCardEvent.turn;
}