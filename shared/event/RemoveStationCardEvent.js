function RemoveStationCardEvent({ stationCard, turn, phase }) {
    return {
        type: 'removeStationCard',
        created: new Date().toISOString(),
        turn,
        phase,
        location: `station-${stationCard.place}`,
        cardId: getStationCardId(stationCard),
        cardCommonId: getStationCardCommonId(stationCard)
    };
}

module.exports = RemoveStationCardEvent;

function getStationCardId(stationCard) {
    return stationCard.card ? stationCard.card.id : stationCard.id;
}

function getStationCardCommonId(stationCard) {
    return stationCard.card ? stationCard.card.commonId : 'unknown';
}