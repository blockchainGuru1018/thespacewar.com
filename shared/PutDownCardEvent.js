module.exports = function ({ turn, location, cardId, cardCommonId }) {
    return {
        type: 'putDownCard',
        created: new Date().toISOString(),
        turn,
        location,
        cardId,
        cardCommonId
    };
};