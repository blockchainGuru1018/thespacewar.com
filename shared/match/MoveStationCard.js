const MoveStationCardEvent = require('../event/MoveStationCardEvent.js');
const Commander = require("./commander/Commander.js");

const ValidLocations = [
    'station-draw',
    'station-action',
    'station-handSize'
];

module.exports = function ({
    matchService,
    playerStateService,
    playerPhase,
    opponentActionLog,
    playerCommanders
}) {

    return {
        canMove,
        move
    };

    function canMove({ cardId, location }) {
        if (!playerCommanders.has(Commander.KeveBakins)) return false;
        if (!playerPhase.isAction()) return false;

        const stationCard = playerStateService.findStationCard(cardId);
        return !!stationCard && ValidLocations.includes(location);
    }

    function move({ cardId, location }) {
        const stationCard = playerStateService.findStationCard(cardId);
        const fromLocation = `station-${stationCard.place}`;
        playerStateService.updateStationCard(cardId, stationCard => {
            const [prefix, stationRowName] = location.split('-');
            stationCard.place = stationRowName;
        });

        playerStateService.storeEvent(createEvent({ cardId, fromLocation, toLocation: location }));
        opponentActionLog.opponentMovedStationCard({ fromLocation, toLocation: location });
    }

    function createEvent({ cardId, fromLocation, toLocation }) {
        const turn = matchService.getTurn();
        return MoveStationCardEvent({ turn, cardId, fromLocation, toLocation });
    }
};
