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