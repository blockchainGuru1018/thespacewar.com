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
    if (row === 'action') {
        return basePriority({
                ownCount: action,
                base: 3,
                min: 1,
                max: 5,
                firstInOrder: 2
            })
            + stayOneAheadOf(draw, { fromCount: 2, untilCount: 3 });
    }
    if (row === 'draw') {
        return basePriority({
                ownCount: draw,
                base: 2,
                min: 1,
                max: 3,
                firstInOrder: 1
            })
            + stayOneAheadOf(action, { fromCount: 3, untilCount: 4 });
    }
    if (row === 'handSize') {
        return basePriority({
                ownCount: handSize,
                base: 1,
                min: 1,
                max: 2,
                firstInOrder: 3
            })
            + stayOneAheadOfAllWhen({
                competitorCountIs: 3,
                competitorCount: draw,
                ownCountIs: 1,
                ownCount: handSize
            });
    }
}

function basePriority({ ownCount, base, min, max, firstInOrder }) {
    if (ownCount < min) {
        return TopPriority - firstInOrder + 1;
    }
    if (ownCount === max) return 0;
    return base;
}

function stayOneAheadOf(competitorCount, { fromCount, untilCount }) {
    if (competitorCount >= fromCount && competitorCount <= untilCount) {
        return competitorCount - fromCount + 1;
    }
    return 0;
}

function stayOneAheadOfAllWhen({ competitorCountIs, competitorCount, ownCountIs, ownCount }) {
    if (competitorCount === competitorCountIs && ownCountIs === ownCount) {
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
