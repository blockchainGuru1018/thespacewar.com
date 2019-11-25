const CommonId = '12';

module.exports = {
    CommonId,
    dormantEffectRequirementSpec: {
        forOpponent: [],
        forPlayer: [
            {
                type: 'findCard',
                count: 1,
                sources: [
                    'opponentCardsInZone'
                ],
                filter: {
                    type: 'duration'
                },
                target: 'opponentDiscardPile'
            }
        ]
    }
};
