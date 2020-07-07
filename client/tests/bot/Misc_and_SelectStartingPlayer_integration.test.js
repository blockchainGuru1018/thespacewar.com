/**
 * @jest-environment node
 */
const MatchMode = require("../../../shared/match/MatchMode.js");
const { setupFromState, BotId, PlayerId } = require("./botTestHelpers.js");

test("When does NOT have control of turn should NOT emit anything", async () => {
    const { matchController } = await setupFromState({
        mode: MatchMode.game,
        currentPlayer: PlayerId,
        phase: "action",
        cardsOnHand: [{ id: "C1A", cost: 0 }],
    });

    expect(matchController.emit).not.toBeCalled();
});

describe("Selecting starting player", () => {
    test("When is choosing starting player should select starting player", async () => {
        const { matchController } = await setupFromState({
            mode: "chooseStartingPlayer",
            currentPlayer: BotId,
        });

        expect(matchController.emit).toBeCalledWith("selectPlayerToStart", {
            playerToStartId: BotId,
        });
    });

    test("When opponent is choosing starting player should NOT select starting player", async () => {
        const { matchController } = await setupFromState({
            mode: "chooseStartingPlayer",
            currentPlayer: PlayerId,
        });

        expect(matchController.emit).not.toBeCalledWith(
            "selectPlayerToStart",
            expect.any(Object)
        );
    });
});
