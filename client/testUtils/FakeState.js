const defaults = require("lodash/defaults");
const FakeCardDataAssembler = require("../../shared/test/testUtils/FakeCardDataAssembler.js");
const Commander = require("../../shared/match/commander/Commander.js");
const createCard = FakeCardDataAssembler.createCard;

module.exports = function FakeState(options = {}) {
  const cardsInZone = options.cardsInZone || [];
  options.cardsInZone = cardsInZone.map((c) => createCard(c));
  options.cardsInOpponentZone = (options.cardsInOpponentZone || []).map((c) =>
    createCard(c)
  );
  options.opponentCardsInZone = (options.opponentCardsInZone || []).map((c) =>
    createCard(c)
  );
  options.cardsOnHand = (options.cardsOnHand || []).map((c) => createCard(c));

  return defaults(options, {
    mode: "game",
    commanders: [Commander.GeneralJackson],
    readyPlayerIds: ["P1A", "P2A"],
    stationCards: [{ place: "draw" }], //Needed to not always show a Defeated screen
    cardsOnHand: [],
    cardsInZone: [],
    cardsInOpponentZone: [],
    discardedCards: [],
    playerCardsInDeckCount: 1,
    opponentCardCount: 0,
    opponentDiscardedCards: [],
    opponentStationCards: [{ place: "draw" }], //Needed to not always show a Defeated screen
    opponentCardsInZone: [],
    opponentCardsInPlayerZone: [],
    opponentCardsInDeckCount: 1,
    events: [],
    requirements: [],
    phase: "wait",
    turn: 1,
    currentDeck:"Regular",
    currentPlayer: "P2A",
    opponentRetreated: false,
    retreatedPlayerId: null,
    playerOrder: ["P1A", "P2A"],
  });
};
