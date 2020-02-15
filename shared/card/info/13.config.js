module.exports = {
    requirementSpecsWhenLookAtHandSizeStationRow: {
        forOpponent: [],
        forPlayer: [
            {
                type: 'findCard',
                count: 1,
                sources: [
                    'handSizeStationCards'
                ],
                target: 'hand',
                cancelable: true
            }
        ]
    }
};
