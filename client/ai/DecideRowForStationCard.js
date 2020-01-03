import RulesForPlayingStationCards from './RulesForPlayingStationCards.json';

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
    if (row === 'draw') {
        return basePriority({
                basePriority: 2,
                minCount: 1,
                maxCount: RulesForPlayingStationCards.MaxInDrawRow,
                orderUntilMinCount: RulesForPlayingStationCards.OrderForDrawRowUntilMinCountReached,
                ownCount: draw
            })
            + stayOneAheadOf(action, { fromCount: 3, untilCount: 4 });
    }
    if (row === 'action') {
        return basePriority({
                basePriority: 3,
                minCount: 1,
                maxCount: RulesForPlayingStationCards.MaxInActionRow,
                orderUntilMinCount: RulesForPlayingStationCards.OrderForActionRowUntilMinCountReached,
                ownCount: action
            })
            + stayOneAheadOf(draw, { fromCount: 2, untilCount: 3 });
    }
    if (row === 'handSize') {
        return basePriority({
                basePriority: 1,
                minCount: 1,
                maxCount: RulesForPlayingStationCards.MaxInHandSizeRow,
                orderUntilMinCount: RulesForPlayingStationCards.OrderForHandSizeRowUntilMinCountReached,
                ownCount: handSize
            })
            + stayOneAheadOfAllWhen({
                competitorCountIs: 3,
                competitorCount: draw,
                ownCountIs: 1,
                ownCount: handSize
            });
    }
}

function basePriority({ ownCount, basePriority, minCount, maxCount, orderUntilMinCount }) {
    if (ownCount < minCount) {
        return TopPriority - orderUntilMinCount + 1;
    }
    if (ownCount === maxCount) return 0;
    return basePriority;
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
