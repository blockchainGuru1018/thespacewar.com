const GoodKarma = require("../../../shared/card/GoodKarma.js");
const ToxicGas = require("../../../shared/card/ToxicGas.js");
const Drone = require("../../../shared/card/Drone.js");
const DroneLeader = require("../../../shared/card/DroneLeader");
const RepairShip = require("../../../shared/card/RepairShip");

module.exports = PlayerCardCapability;

const PlayableTypes = ["spaceShip", "defense", "missile"];

const PlayableCards = [GoodKarma.CommonId, ToxicGas.CommonId];
const PriorityCards = [
  Drone.CommonId,
  DroneLeader.CommonId,
  RepairShip.CommonId,
];

function PlayerCardCapability({
  playerStateService,
  matchController,
  playableTypes = PlayableTypes,
  playableCards = PlayableCards,
  priorityCards = PriorityCards,
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
    const priorityCard = playableCards.find((card) =>
      priorityCards.includes(card.commonId)
    );
    const card = priorityCard || playableCards[0];
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
