const CommonId = '31';
const DrawCardsCount = 2;

module.exports = {
    CommonId,
    choiceToRequirementSpec: {
        draw: {
            forOpponent: [],
            forPlayer: [
                {
                    type: 'drawCard',
                    count: DrawCardsCount,
                    cardCommonId: CommonId
                }
            ]
        },
        counter: {
            forOpponent: [],
            forPlayer: [
                {
                    type: 'counterCard',
                    count: 1,
                    sources: [
                        'opponentAny'
                    ],
                    filter: {
                        canBeCountered: true
                    }
                }
            ]
        }
    },
    choicesWhenPutDownInHomeZone: [
        {
            name: 'counter',
            text: 'Counter a card costing 2 or less'
        },
        {
            name: 'draw',
            text: `Draw ${DrawCardsCount} cards`
        }
    ]
};
