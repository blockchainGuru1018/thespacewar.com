function AttackEvent({ turn, attackerCardId, defenderCardId = null, targetStationCardIds = null, cardCommonId, countered = false }) {
    let event = {
        type: 'attack',
        created: Date.now(),
        turn,
        attackerCardId,
        cardCommonId,
        countered
    };
    if (defenderCardId) {
        event.defenderCardId = defenderCardId;
    }
    if (targetStationCardIds) {
        event.targetStationCardIds = targetStationCardIds;
    }
    return event;
}

AttackEvent.forTest = data => {
    const attackEvent = AttackEvent(data);
    attackEvent.created = data.created || attackEvent.created;
    return attackEvent;
};

AttackEvent.card = (attackerCardId, defenderCardId, created) => {
    const attackEvent = AttackEvent({ attackerCardId, defenderCardId });
    if (created) {
        attackEvent.created = typeof created === 'string' ? Date.parse(created) : created;
    }
    return attackEvent;
};

module.exports = AttackEvent;
