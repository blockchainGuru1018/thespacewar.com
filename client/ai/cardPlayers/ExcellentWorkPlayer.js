const ExcellentWork = require('../../../shared/card/ExcellentWork.js');

module.exports = function ({
    matchController,
    decideRowForStationCard
}) {
    return {
        forCard,
        play
    };

    function forCard(card) {
        return card.commonId === ExcellentWork.CommonId;
    }

    function play(card) {
        matchController.emit('putDownCard', {
            cardId: card.id,
            location: location(),
            choice: 'putDownAsExtraStationCard'
        });
    }

    function location() {
        return `station-${decideRowForStationCard()}`;
    }
};
