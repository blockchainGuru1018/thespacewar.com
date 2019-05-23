const CommonId = '67';

module.exports = {
    CommonId,
    requirementSpecsWhenPutDownInHomeZone: {
        forOpponent: [
            { type: 'drawCard', count: 1, cardCommonId: CommonId }
        ],
        forPlayer: [
            {
                type: 'findCard',
                count: 1,
                sources: [
                    'opponentHand',
                    "opponentDrawStationCards",
                    "opponentActionStationCards",
                    "opponentHandSizeStationCards"
                ],
                filter: {
                    onlyFlippedStationCards: true
                },
                target: 'opponentDiscardPile'
            }
        ]
    }
};
