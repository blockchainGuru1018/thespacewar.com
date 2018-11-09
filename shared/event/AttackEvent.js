AttackEvent.cardHasAlreadyAttackedThisTurn = (currentTurn, attackerCardId, events) => {
    return events.some(event => {
        return event.turn === currentTurn
            && event.type === 'attack'
            && event.attackerCardId === attackerCardId
    });
};

function AttackEvent({ turn, attackerCardId, cardCommonId }) {
    return {
        type: 'attack',
        created: new Date().toISOString(),
        turn,
        attackerCardId,
        cardCommonId
    };
}

module.exports = AttackEvent;