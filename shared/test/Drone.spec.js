const Drone = require("../card/Drone");
const { createCard } = require("./testUtils/shared.js");
const Commander = require("../../shared/match/commander/Commander.js");
const { PHASES } = require("../phases.js");

describe("Drone ", () => {
  it("should have a 1 attack boost when playing with Crakux", () => {
    const card = new createCard(Drone, {
      card: { attack: 1 },
      playerStateService: {
        getCurrentCommander: () => Commander.Crakux,
      },
    });
    expect(card.attack).toBe(2);
  });
  it("should have a +3 from Collision skill", () => {
    const card = new createCard(Drone, {
      card: {
        attack: 1,
        usingCollision: true,
      },
      cardEffect: {
        attackBoostForCollision: () => 3,
        attackBoostForCardType: () => 0,
      },
      playerStateService: {
        getCurrentCommander: () => Commander.Crakux,
      },
    });
    expect(card.attack).toBe(3);
  });

  it("should bee able to attack on next turn when was granted from free event", () => {
    const card = new createCard(Drone, {
      card: {
        attack: 1,
        usingCollision: true,
      },
      canThePlayer: {
        attackStationCards: () => true,
        attackWithThisCard: () => true,
      },
      queryEvents: {
        hasMovedOnPreviousTurn: (id, turn) => false,
        wasGrantedByFreeEventOnPreviousTurnAtOpponentZone: (id, turn) => true,
        getAttacksOnTurn: () => 0,
      },
      matchService: {
        getTurn: () => 2,
      },
      playerStateService: {
        getCurrentCommander: () => Commander.Crakux,
        getPhase: () => PHASES.attack,
        isCardStationCard: () => false,
        isCardInHomeZone: () => false,
      },
    });
    expect(card.canAttackStationCards()).toBeTruthy();
  });

  it("should not bee able to attack on first turn that is granted from free event", () => {
    const card = new createCard(Drone, {
      card: {
        attack: 1,
        usingCollision: true,
      },
      canThePlayer: {
        attackStationCards: () => true,
        attackWithThisCard: () => true,
      },
      queryEvents: {
        hasMovedOnPreviousTurn: (id, turn) => false,
        wasGrantedByFreeEventOnPreviousTurnAtOpponentZone: (id, turn) => false,
        getAttacksOnTurn: () => 0,
      },
      matchService: {
        getTurn: () => 2,
      },
      playerStateService: {
        getCurrentCommander: () => Commander.Crakux,
        getPhase: () => PHASES.attack,
        isCardStationCard: () => false,
        isCardInHomeZone: () => false,
      },
    });
    expect(card.canAttackStationCards()).toBeFalsy();
  });
});
