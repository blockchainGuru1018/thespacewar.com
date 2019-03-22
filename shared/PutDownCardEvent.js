module.exports = function ({ turn, location, cardId, cardCommonId, grantedForFreeByEvent = false }) {
    return {
        type: 'putDownCard',
        created: new Date().toISOString(),
        turn,
        location,
        cardId,
        cardCommonId,
        grantedForFreeByEvent
    };
};