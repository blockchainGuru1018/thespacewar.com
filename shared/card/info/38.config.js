const CommonId = '38';

module.exports = {
    CommonId,
    requirementSpecsWhenPutDownInHomeZone: {
        forOpponent: [{
            onlyWhenNot: ['targetIsFlippedStationCard'],
            type: 'drawCard',
            count: 2,
            cardCommonId: CommonId
        }],
        forPlayer: []
    }
};
