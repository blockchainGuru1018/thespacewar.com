const FakeCardDataAssembler = require("../../shared/test/testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
const createState = require("../../shared/test/fakeFactories/createState.js");
const TestHelper = require("../../shared/test/fakeFactories/TestHelper.js");

describe("trigger naalox dormant effect", () => {
  it("Should be able t", () => {
    const testHelper = TestHelper(
      createState({
        playerStateById: {
          P1A: { cardsInZone: [createCard({ id: "C1A" })] },
          P2A: { cardsInZone: [createCard({ id: "C3A" })] },
        },
      })
    );
  });
});
