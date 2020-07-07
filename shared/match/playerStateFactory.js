const FakeCardDataAssembler = require("../test/testUtils/FakeCardDataAssembler.js");

module.exports = {
  empty,
};

function empty() {
  return {
    phase: "wait",
    cardsOnHand: [],
    cardsInZone: [],
    cardsInOpponentZone: [],
    stationCards: [{ card: { id: "default_station_card" }, place: "draw" }], //Almost none of the tests test end game conditions, so at least one station card is added as default to make it declutter the tests
    discardedCards: [],
    events: [],
    requirements: [],
    commanders: [],
    actionLogEntries: [],
    cardsInDeck: [FakeCardDataAssembler.createCard()],
    clock: {
      events: [],
    },
  };
}
