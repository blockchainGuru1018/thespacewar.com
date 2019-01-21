module.exports = superclass => class extends superclass {
    canAttack() {
        return canAttackAnyCard(this);
    }

    canAttackStationCards() {
        return canAttackAnyCard(this);
    }
};

function canAttackAnyCard(context) {
    const turn = context._matchInfoRepository.getTurn();
    const attacks = context._queryEvents.getAttacksOnTurn(context._card.id, turn);
    const currentPlayerPhase = context._matchInfoRepository.getPlayerPhase(context.playerId)
    return currentPlayerPhase === 'attack' && attacks.length < 2;
}