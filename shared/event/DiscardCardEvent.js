module.exports = function ({ turn, phase, cardId }) {
    return {
        type: 'discardCard',
        created: new Date().toISOString(),
        turn,
        phase,
        cardId,
    };
};