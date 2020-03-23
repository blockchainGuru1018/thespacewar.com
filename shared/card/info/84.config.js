const CommonId = '84';

module.exports = {
    CommonId,
    requirementSpecsWhenPutDownInHomeZone: {
        forOpponent: [],
        forPlayer: [
            {type: 'drawCard', count: 1, cardCommonId: CommonId}
        ]
    }
};
