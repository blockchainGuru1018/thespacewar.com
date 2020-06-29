function DiscardCardEvent({ turn, phase, cardId, cardCommonId }) {
    return {
        type: DiscardCardEvent.Type,
        created: Date.now(),
        turn,
        phase,
        cardId,
        cardCommonId
    };
}

DiscardCardEvent.Type = 'discardCard';

module.exports = DiscardCardEvent;
