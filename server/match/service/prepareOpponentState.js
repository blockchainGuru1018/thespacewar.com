const obscureOpponentEvents = require("./obscureOpponentEvents.js");
const itemNamesForOpponentByItemNameForPlayer = require("../itemNamesForOpponentByItemNameForPlayer.js");
const StatePreparer = require("./StatePreparer.js");
const MatchMode = require("../../../shared/match/MatchMode.js");

const obscurerByKey = {
  stationCards: {
    obscure: require("./prepareStationCardsForClient"),
    key: "stationCards",
  },
  cardsOnHand: {
    obscure(cardsOnHand) {
      return cardsOnHand.length;
    },
    key: "opponentCardCount",
  },
  cardsInDeck: {
    obscure(cardsInDeck) {
      return cardsInDeck.length;
    },
    key: "opponentCardsInDeckCount",
  },
  deckSize: {
    obscure(deckSize) {
      return deckSize;
    },
    key: "opponentDeckSize",
  },
  events: {
    obscure: obscureOpponentEvents,
    key: "opponentEvents",
  },
  actionLogEntries: {
    obscure: (value) => value,
    key: "opponentActionLogEntries",
  },
  commanders: {
    obscure: (value, context) => {
      if (context.matchMode === MatchMode.game) {
        return value;
      }

      return [];
    },
    key: "opponentCommanders",
  },
  clock: {
    obscure: (value) => value,
    key: "opponentClock",
  },
  requirements: {
    obscure: (value) => {
      return value.map((requirement) => ({
        type: requirement.type,
        count: requirement.count,
      }));
    },
    key: "opponentRequirements",
  },
};

const whitelist = [
  "discardedCards",
  "cardsInZone",
  "cardsInOpponentZone",
  "cardsInDeck",
  "stationCards",
  "cardsOnHand",
  "events",
  "phase",
  "actionLogEntries",
  "commanders",
  "clock",
  "requirements",
  "opponentDeckSize",
  "deckSize",
];

const statePreparer = StatePreparer({
  whitelist,
  obscureHandlerByKey: obscurerByKey,
  alternateItemNames: itemNamesForOpponentByItemNameForPlayer,
});
module.exports = statePreparer.prepare;
