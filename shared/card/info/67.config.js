const CommonId = '67';

module.exports = {
    CommonId,
    requirementSpecsWhenPutDownInHomeZone: {
        opponentIsFirst: true,
        forOpponent: [
            {
                type: 'drawCard',
                count: 1,
                cardCommonId: CommonId,
                common: true,

                ifAddedAddAlso: [{
                    forOpponent: [],
                    forPlayer: [{ type: 'drawCard', count: 0, common: true, waiting: true }]
                }],

                whenResolvedAddAlso: [{
                    forOpponent: [{
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
                    }],
                    forPlayer: []
                }]
            }
        ],
        forPlayer: []
    }
};
