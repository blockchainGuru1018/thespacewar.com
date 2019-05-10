const CommonId = '34';

module.exports = {
    CommonId,
    dormantEffectRequirementSpec: {
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
};
