const Rows = () => ['draw', 'action', 'handSize'];
const TopPriority = 999;
module.exports = function ({
    playerStateService
}) {
    return () => {
        const stationCards = playerStateService.getStationCards();
        stationCards.slice();
        const stationCardsPlacesSortedByCount = Rows().sort(SortRowsByOccurrence(stationCards));
        return stationCardsPlacesSortedByCount[0];
    }
};

function SortRowsByOccurrence(stationCards) {
    return (a, b) => {
        const aCount = stationCards.filter(s => s.place === a).length;
        const bCount = stationCards.filter(s => s.place === b).length;
        const counts = stationRowCounts(stationCards);
        return (aCount - getPriorityInRelationToCardCounts(a, counts)) - (bCount - getPriorityInRelationToCardCounts(b, counts));
    };
}

function getPriorityInRelationToCardCounts(row, { draw, action, handSize }) {
    //Max cap
    if (row === 'draw' && draw === 3) {
        return 0;
    }
    if (row === 'handSize' && handSize === 2) {
        return 0;
    }

    //Min cap
    if (draw === 0) {
        if (row === 'draw') return TopPriority;
        if (row === 'action') return 0;
        if (row === 'handSize') return 0;
    }
    if (action === 0) {
        if (row === 'draw') return 0;
        if (row === 'action') return TopPriority;
        if (row === 'handSize') return 0;
    }
    if (handSize === 0) {
        if (row === 'draw') return 0;
        if (row === 'action') return 0;
        if (row === 'handSize') return TopPriority;
    }

    //Keep all at 1 until action has 3
    if (action < 3 && row !== 'action') {
        return 0;
    }

    //When action is 3 and draw is 2 bring action up to 4
    if (action === 3 && draw === 2 && row === 'action') {
        return TopPriority;
    }

    //Priorities
    if (row === 'action') {
        return 3;
    }
    if (row === 'draw') {
        return 2;
    }
    if (row === 'handSize') {
        return 1;
    }
    return 0;
}

function stationRowCounts(stationCards) {
    return {
        draw: stationCards.filter(s => s.place === 'draw').length,
        action: stationCards.filter(s => s.place === 'action').length,
        handSize: stationCards.filter(s => s.place === 'handSize').length
    };
}
