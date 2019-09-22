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
        return (aCount - getPriority(a, aCount)) - (bCount - getPriority(b, bCount));
    };
}

function getPriority(row, currentCount) {
    if (currentCount === 0) return TopPriority;
    if (currentCount === 4) return 0;

    if (row === 'draw') return 1;
    if (row === 'action') return 4;
    if (row === 'handSize') return 1;
    return 0;
}
