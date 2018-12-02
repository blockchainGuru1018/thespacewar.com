const Card = require('./Card.js');
const DiscardCardEvent = require('../event/DiscardCardEvent.js');
const AttackEvent = require('../event/AttackEvent.js');

module.exports = function EnergyShield(deps) {

    const {
        getState,
        getPlayerState,
        emitEvent,
        emitToPlayer,
        getOpponentId,
        updatePlayerCard,
        updatePlayerStationCard,
        prepareStationCardsForClient
    } = deps.matchService;
    const playerId = deps.playerId;
    const baseCard = deps.card;

    return {
        hasEffectOnStationAttack: () => {
            return true
        },
        getImportanceOnStationAttack: () => {
            return 1
        },
        applyEffectOnStationAttack
    };

    function applyEffectOnStationAttack({ attackerCard, targetStationCardIds }) {
        const defenseBeforeAttack = baseCard.defense - baseCard.damage;

        attackerCard.attackCard(baseCard);

        const defendedTargetsCount = baseCard.destroyed
            ? defenseBeforeAttack
            : defenseBeforeAttack - (baseCard.defense - baseCard.damage);

        const targetIdsNotProtected = targetStationCardIds.slice(defendedTargetsCount);
        const playerState = getPlayerState(playerId);
        const state = getState();

        if (baseCard.destroyed) {
            const cardIndex = playerState.cardsInZone.findIndex(c => c.id === baseCard.id);
            const [cardData] = playerState.cardsInZone.splice(cardIndex);
            playerState.discardedCards.push(cardData);
            emitEvent(playerId, DiscardCardEvent({ //TODO Will this result in more action points..? Or should this event be a "CardDestroyedEvent"?
                turn: state.turn,
                phase: playerState.phase,
                cardId: baseCard.id,
                cardCommonId: baseCard.commonId
            }));
        }
        else {
            updatePlayerCard(playerId, baseCard.id, card => {
                card.damage = baseCard.damage;
            });
        }

        let affectedItems = new Set(['cardsInZone']);
        if (baseCard.destroyed) {
            affectedItems.add('discardedCards');
            affectedItems.add('events');
        }
        if (targetIdsNotProtected.length) {
            affectedItems.add('stationCards');
        }

        return { targetStationCardIds: targetIdsNotProtected, affectedItems }
    }
}