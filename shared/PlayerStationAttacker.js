const CheatError = require('../server/match/CheatError.js');

module.exports = function ({
    matchService,
    stateSerializer,
    stateMemento,
    playerStateService,
    canThePlayer,
    opponentStateService,
    opponentActionLog
}) {

    return {
        validateAttackOnStationCards,
        attackStationCards
    };

    function validateAttackOnStationCards(playerId, { attackerCardId, targetStationCardIds }) {
        const cannotAttackStationCards = canThePlayer.attackStationCards();
        if (!cannotAttackStationCards) throw new CheatError('Cannot attack station cards');
        const attackerCardData = playerStateService.findCard(attackerCardId);
        const opponentStationCards = opponentStateService.getStationCards();
        const unflippedOpponentStationCardsCount = opponentStateService.getUnflippedStationCardsCount();
        if (unflippedOpponentStationCardsCount > targetStationCardIds.length
            && attackerCardData.attack > targetStationCardIds.length) {
            throw new CheatError('Need more target station cards to attack');
        }

        const attackerCard = playerStateService.createBehaviourCard(attackerCardData);
        if (!attackerCard.canAttackStationCards()) {
            throw new CheatError('Cannot attack station');
        }
        if (targetStationCardIds.length > attackerCard.attack) {
            throw new CheatError('Cannot attack that many station cards with card');
        }

        const targetStationCards = opponentStationCards.filter(s => targetStationCardIds.includes(s.card.id));
        if (targetStationCards.some(c => c.flipped)) {
            throw new CheatError('Cannot attack a flipped station card');
        }
    }

    function attackStationCards({ attackerCardId, targetStationCardIds }) {
        const targetStationCards = opponentStateService.getStationCards().filter(s => targetStationCardIds.includes(s.card.id));
        if (!targetStationCards.length) return;

        const stateBeforeAttack = stateSerializer.serialize(matchService.getState());

        for (const targetCardId of targetStationCardIds) {
            opponentStateService.flipStationCard(targetCardId);
        }

        const event = playerStateService.registerAttack({ attackerCardId, targetStationCardIds });

        const attackData = { attackerCardId, defenderCardIds: targetStationCardIds, time: event.created };
        stateMemento.saveStateForAttackData(stateBeforeAttack, attackData);

        opponentActionLog.stationCardsWereDamaged({ targetCount: targetStationCardIds.length });

        const attackerCardData = playerStateService.findCard(attackerCardId);
        const attackerCard = playerStateService.createBehaviourCard(attackerCardData);
        if (attackerCard.type === 'missile') {
            playerStateService.removeCard(attackerCardId);
            playerStateService.discardCard(attackerCardData);
        }
    }
};
