const Electrocution = require("../../../../shared/card/Electrocution.js");

PutDownElectrocution.CommonId = Electrocution.CommonId;

function PutDownElectrocution({ playerServiceProvider, matchService }) {
  return {
    forPlayer,
  };

  function forPlayer(playerId, cardData) {
    const playerStateService = playerServiceProvider.getStateServiceById(
      playerId
    );
    const opponentId = matchService.getOpponentId(playerId);
    const opponentStateService = playerServiceProvider.getStateServiceById(
      opponentId
    );

    const opponentCardsInZones = [
      ...opponentStateService.getCardsInZone(),
      ...opponentStateService.getCardsInOpponentZone(),
    ];

    for (const opponentCard of opponentCardsInZones) {
      if (opponentCard.type === "defense" || opponentCard.type === "missile") {
        opponentStateService.removeCard(opponentCard.id);
        opponentStateService.discardCard(opponentCard);
      } else if (opponentCard.type === "spaceShip") {
        opponentCard.paralyzed = true;
      }
    }

    const playerCardsInZones = [
      ...playerStateService.getCardsInZone(),
      ...playerStateService.getCardsInOpponentZone(),
    ];

    for (const playerCard of playerCardsInZones) {
      if (playerCard.type === "defense" || playerCard.type === "missile") {
        playerStateService.removeCard(playerCard.id);
        playerStateService.discardCard(playerCard);
      } else if (playerCard.type === "spaceShip") {
        playerCard.paralyzed = true;
      }
    }

    playerStateService.putDownEventCardInZone(cardData);
  }
}

module.exports = PutDownElectrocution;
