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
      applyElectrocutionEffect(opponentCard, opponentStateService);
    }

    const playerCardsInZones = [
      ...playerStateService.getCardsInZone(),
      ...playerStateService.getCardsInOpponentZone(),
    ];

    for (const playerCard of playerCardsInZones) {
      applyElectrocutionEffect(playerCard, playerStateService);
    }

    playerStateService.putDownEventCardInZone(cardData);
  }

  function applyElectrocutionEffect(card, stateService) {
    if (card.type === "defense" || card.type === "missile") {
      stateService.removeCard(card.id);
      stateService.discardCard(card);
    } else if (card.type === "spaceShip") {
      card.paralyzed = true;
    }
  }
}

module.exports = PutDownElectrocution;
