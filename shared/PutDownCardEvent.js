function PutDownCardEvent({ turn, location, cardId, cardCommonId, grantedForFreeByEvent = false, putDownAsExtraStationCard = false, startingStation = false }) {
    return {
        type: PutDownCardEvent.Type,
        created: Date.now(),
        turn,
        location,
        cardId,
        cardCommonId,
        putDownAsExtraStationCard, //TODO Rename to "extraStationCard", Note: Extra station cards cost (are not free like regular station cards) and can also be countered,
        grantedForFreeByEvent, //TODO This only goes for cards moved form station to zone, perhaps refactor to two events "PutDownZoneCardEvent" and "PutDownStationCardEvent"?
        startingStation // TODO See above statement about the "grantedForFreeByEvent" property
    };
}

PutDownCardEvent.forTest = data => {
    data.location = 'location' in data ? data.location : '';
    const event = PutDownCardEvent(data);
    event.created = 'created' in data ? data.created : event.created;
    return event;
};

PutDownCardEvent.Type = 'putDownCard';

module.exports = PutDownCardEvent;
