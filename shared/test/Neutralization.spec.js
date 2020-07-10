const Neutralization = require("../card/Neutralization.js");
const { createCard } = require("./testUtils/shared.js");

describe("USE Dormant Effect of Neutralization", () => {
  it("Should be able to USE when its the only neutralization card on the board", () => {
    const neutralization = new createCard(Neutralization, {
      queryEvents: {
        getTimeWhenOpponentCardWasPutDownByCommonId: (commonId) => null,
        getTimeWhenCardWasPutDownById: (cardId) => new Date(),
      },
    });

    expect(neutralization.canTriggerDormantEffect()).toBeTruthy();
  });

  it("Should be able to USE when its the last neutralization card putted down on the board", () => {
    const opponentPutDownNeutralizationTimestamp = new Date(
      "2020-06-24T11:05:00.135Z"
    );
    const playerPutDownNeutralizationTimestamp = new Date(
      "2020-06-24T11:06:00.135Z"
    );
    const neutralization = new createCard(Neutralization, {
      queryEvents: {
        getTimeWhenOpponentCardWasPutDownByCommonId: (commonId) =>
          opponentPutDownNeutralizationTimestamp,
        getTimeWhenCardWasPutDownById: (cardId) =>
          playerPutDownNeutralizationTimestamp,
      },
    });

    expect(neutralization.canTriggerDormantEffect()).toBeTruthy();
  });

  it("Should no be able to USE when its wast the first neutralization card putted down on the board", () => {
    const opponentPutDownNeutralizationTimestamp = new Date(
      "2020-06-24T11:07:00.135Z"
    );
    const playerPutDownNeutralizationTimestamp = new Date(
      "2020-06-24T11:06:00.135Z"
    );
    const neutralization = new createCard(Neutralization, {
      queryEvents: {
        getTimeWhenOpponentCardWasPutDownByCommonId: (commonId) =>
          opponentPutDownNeutralizationTimestamp,
        getTimeWhenCardWasPutDownById: (cardId) =>
          playerPutDownNeutralizationTimestamp,
      },
    });

    expect(neutralization.canTriggerDormantEffect()).toBeFalsy();
  });
});
