const Deck = require("./Deck.js");

module.exports = function (deps) {
  const cardDataAssembler = deps.cardDataAssembler;

  return {
    create,
    createCardsForDeckById,
  };

  function create(cards) {
    return Deck(cards);
  }

  function createCardsForDeckById(deckId, customDeck) {
    const deck = createDeckById(deckId, customDeck);
    shuffle(deck);
    return deck;
  }

  function createDeckById(deckId, customDeck) {
    switch (deckId) {
      case "Regular":
        return cardDataAssembler.createRegularDeck();
      case "TheSwarm":
        return cardDataAssembler.createSwarmDeck();
      case "UnitedStars":
        return cardDataAssembler.createUnitedStars();
      case "CustomDeck":
        return cardDataAssembler.createCustomDeck(customDeck);
      default:
        throw new Error("Invalid Deck ID");
    }
  }
};
function shuffle(array) {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
}
