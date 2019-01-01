module.exports = function ({ turn, phase, cardId, cardCommonId, isSacrifice = false }) {
    return {
        type: 'discardCard',
        created: new Date().toISOString(),
        turn,
        phase,
        cardId,
        cardCommonId,
        isSacrifice
    };
};