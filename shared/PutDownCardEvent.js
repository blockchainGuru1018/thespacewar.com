function PutDownCardEvent({ turn, location, cardId, cardCommonId, grantedForFreeByEvent = false, putDownAsExtraStationCard = false }) {
    return {
        type: 'putDownCard',
        created: Date.now(),
        turn,
        location,
        cardId,
        cardCommonId,
        grantedForFreeByEvent,
        putDownAsExtraStationCard //Extra station cards cost (are not free like regular station cards) and can also be countered
    };
}

PutDownCardEvent.forTest = data => {
    data.location = '';
    return PutDownCardEvent(data);
};

module.exports = PutDownCardEvent;
