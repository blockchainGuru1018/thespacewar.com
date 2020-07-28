const GoodKarma = require("../../../shared/card/GoodKarma.js");

module.exports = PlayerCardCapability;

const PlayableTypes = ["spaceShip", "defense", "missile"];

const PlayableCards = [GoodKarma.CommonId];

function PlayerCardCapability({
  playerStateService,
  matchController,
  playableTypes = PlayableTypes,
  playableCards = PlayableCards,
  cardPlayers,
  cardRules,
}) {
  return {
    canDoIt,
    doIt,
  };

  function canDoIt() {
    const playableCards = playableCardsOnHandAndInStation();
    return playableCards.length > 0;
  }

  function doIt() {
    const playableCards = playableCardsOnHandAndInStation().sort(
      CheapestFirst()
    );

    const card = playableCards[0];
    playCard(card);
  }

  function playableCardsOnHandAndInStation() {
    return playerStateService.getMatchingPlayableBehaviourCards(canPlayCard);
  }

  function CheapestFirst() {
    return (a, b) => a.costToPlay - b.costToPlay;
  }

  function playCard(card) {
    const hasSpecificPlayer = cardPlayers.find((player) =>
      player.forCard(card)
    );
    if (hasSpecificPlayer) {
      hasSpecificPlayer.play(card);
    } else {
      matchController.emit("putDownCard", {
        cardId: card.id,
        location: "zone",
      });
    }
  }

  function canPlayCard(card) {
    return (
      canPlayCardTypeOrSpecificCard(card) &&
      cardRules.every((rule) => rule(card))
    );
  }

  function canPlayCardTypeOrSpecificCard(card) {
    return (
      playableTypes.includes(card.type) ||
      playableCards.includes(card.commonId) ||
      cardPlayers.some((player) => player.forCard(card))
    );
  }
}
