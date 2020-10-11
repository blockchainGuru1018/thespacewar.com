const BaseCard = require("../card/BaseCard");
const { createCard } = require("./testUtils/shared.js");

describe("Attack station card", () => {
  it("should not be able to attack station cards", () => {
    const baseCard = new BaseCard({
      card: { attack: 2 },
      canThePlayer: {
        attackStationCards: (card) => true,
        attackWithThisCard: () => true,
      },
      cardEffect: {
        attackBoostForCollision: (card) => 0,
        attackBoostForCardType: (card) => 0,
      },
      opponentStateService: {
        getMatchingBehaviourCards: () => [],
      },
      queryEvents: {
        getAttacksOnTurn: (card, turn) => [],
        hasMovedOnPreviousTurn: (card, turn) => false,
        wasGrantedByFreeEventOnPreviousTurnAtOpponentZone: (card) => false,
      },
      playerStateService: {
        getPhase: () => "attack",
        isCardStationCard: (card) => false,
        isCardInHomeZone: (card) => false,
      },
      matchService: {
        getTurn: () => 2,
      },
    });

    expect(baseCard.canAttackStationCards()).toBeFalsy();
  });
});
