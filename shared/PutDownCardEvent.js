module.exports = function ({ turn, location, cardId }) {
    return {
        type: 'putDownCard',
        created: new Date().toISOString(),
        turn,
        location,
        cardId,
    };
};