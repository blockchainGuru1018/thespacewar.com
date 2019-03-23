module.exports = function ({ turn, location, cardId, cardCommonId, grantedForFreeByEvent = false, putDownAsExtraStationCard = false }) {
    return {
        type: 'putDownCard',
        created: new Date().toISOString(),
        turn,
        location,
        cardId,
        cardCommonId,
        grantedForFreeByEvent,
        putDownAsExtraStationCard
    };
};