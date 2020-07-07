const CommonId = "14";
const DrawCardsCount = 3;

module.exports = {
    CommonId,
    choiceToRequirementSpec: {
        draw: {
            forOpponent: [],
            forPlayer: [
                {
                    type: "drawCard",
                    count: DrawCardsCount,
                    cardCommonId: CommonId,
                },
            ],
        },
    },
    choicesWhenPutDownInHomeZone: [
        {
            name: "draw",
            text: `Draw ${DrawCardsCount} cards`,
        },
        {
            name: "putDownAsExtraStationCard",
            text: "Put down as extra station card",
            action: {
                name: "putDownCard",
                text: "Put down as extra station card",
                showOnlyGhostsFor: ["playerStation"],
            },
        },
    ],
};
