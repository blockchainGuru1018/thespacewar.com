const Supernova = require("../card/Supernova.js");
const Avoid = require("../card/Avoid.js");
const {createCard} = require("./testUtils/shared.js");

describe("Cannot play Supernova", () => {
    it("when opponent has Avoid in play should NOT be able to player Supernova", () => {
        const card = new createCard(Supernova, {
            queryBoard: {
                opponentHasCardInPlay: (matcher) =>
                    matcher({commonId: Avoid.CommonId}),
            },
        });
        expect(card.canBePlayed()).toBe(false);
    });

    it("when player has less than 3 cards in the station un-flipped", () => {
        const card = new createCard(Supernova, {
            queryBoard: {
                opponentHasCardInPlay: (matcher) =>
                    matcher({commonId: Avoid.CommonId}),
            },
            playerStateService: {
                getUnflippedStationCards: () => [{}, {}],
            },
        });
        expect(card.canBePlayed()).toBe(false);
    });
});
