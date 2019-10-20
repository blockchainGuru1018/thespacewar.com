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
    if (draw === 0) {
        if (row === 'draw') return TopPriority;
        if (row === 'action') return 0;
        if (row === 'handSize') return 0;
    }
    if (handSize === 0) {
        if (row === 'draw') return 0;
        if (row === 'action') return 0;
        if (row === 'handSize') return TopPriority;
    }
    if (action === 0) {
        if (row === 'draw') return 0;
        if (row === 'action') return TopPriority;
        if (row === 'handSize') return 0;
    }

    if (row === 'draw') {
        if (draw === 2) return 0;
        if (action > 2) return TopPriority;
        return 3;
    }
    if (row === 'action') {
        return 6;
    }
    if (row === 'handSize') {
        if (handSize === 2) return 0;
        return 3;
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
