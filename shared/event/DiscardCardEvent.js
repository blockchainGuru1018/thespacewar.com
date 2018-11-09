module.exports = function ({ turn, phase, cardId, cardCommonId }) {
    return {
        type: 'discardCard',
        created: new Date().toISOString(),
        turn,
        phase,
        cardId,
        cardCommonId
    };
};