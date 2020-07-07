const CommonId = "88";

module.exports = {
    CommonId,
    requirementSpecsWhenPutDownInHomeZone: {
        forOpponent: [],
        forPlayer: [
            {
                type: "findCard",
                count: 2,
                actionPointsLimit: 6,
                sources: ["discardPile"],
                target: "hand",
                submitOnEverySelect: true,
                cancelable: true,
            },
        ],
    },
};
