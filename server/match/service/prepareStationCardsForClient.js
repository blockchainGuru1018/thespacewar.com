function prepareStationCardsForClient(stationCards) {
    return stationCards.map(prepareStationCardForClient);
}

function prepareStationCardForClient(stationCard) {
    let model = {
        id: stationCard.card.id,
        place: stationCard.place
    };
    if (stationCard.flipped) {
        model.flipped = true;
        model.card = stationCard.card;
    }
    return model;
}

module.exports = prepareStationCardsForClient;