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
        const counts = stationRowCounts(stationCards);
        return getPriorityInRelationToCardCounts(b, counts) - getPriorityInRelationToCardCounts(a, counts);
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

    if (row === 'action') {
        return 3 + stayOneAheadOf(draw, { fromCount: 2, untilCount: 3 });
    }
    if (row === 'draw') {
        return 2 + stayOneAheadOf(action, { fromCount: 3, untilCount: 4 });
    }
    if (row === 'handSize') {
        return 1 + stayOneAheadOfAllWhen(draw, { fromCount: 3 });
    }
}

function stayOneAheadOf(competitorCount, { fromCount, untilCount }) {
    return (Math.min(untilCount - fromCount + 1, Math.max(0, competitorCount - (fromCount - 1))));
}

function stayOneAheadOfAllWhen(competitorCount, { fromCount }) {
    if (competitorCount === fromCount) {
        return TopPriority;
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
