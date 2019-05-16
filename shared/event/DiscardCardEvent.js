module.exports = function ({ turn, phase, cardId, cardCommonId }) {
    return {
        type: 'discardCard',
        created: Date.now(),
        turn,
        phase,
        cardId,
        cardCommonId
    };
};
