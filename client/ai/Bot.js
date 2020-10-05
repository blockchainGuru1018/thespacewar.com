const MatchMode = require("../../shared/match/MatchMode.js");
const Commander = require("../../shared/match/commander/Commander.js");
// TODO: extrac me
const Drone = require("../../shared/card/Drone.js");
const Fusion = require("../../shared/card/Fusion.js");
const Carrier = require("../../shared/card/Carrier.js");

module.exports = function ({
  matchService,
  playerStateService,
  queryPlayerRequirements,
  playerRuleService,
  playerPhase,
  playerCommanders,
  turnControl,
  opponentStateService,
  drawPhaseDecider,
  preparationPhaseDecider,
  actionPhaseDecider,
  discardPhaseDecider,
  decideCardToDiscard,
  decideCardToSacrifice,
  attackPhaseDecider,
  matchController,
}) {
  if (queryPlayerRequirements.isWaitingOnOpponentFinishingRequirement()) return;
  if (hasAnyRequirements()) {
    performRequirement();
  }

  if (matchService.isGameOn() && turnControl.opponentHasControl()) return;

  if (isChoosingStartingPlayer()) {
    choosingStartingPlayer();
  } else if (isSelectingStartingStationCards()) {
    selectingStartingStationCards();
  } else {
    if (playerPhase.isDraw()) {
      drawPhaseDecider.decide();
    } else if (playerPhase.isPreparation()) {
      preparationPhaseDecider.decide();
    } else if (playerPhase.isAction()) {
      actionPhaseDecider.decide();
    } else if (playerPhase.isDiscard()) {
      discardPhaseDecider.decide();
    } else if (playerPhase.isAttack()) {
      attackPhaseDecider.decide();
    }
  }

  function isChoosingStartingPlayer() {
    return (
      matchService.mode() === MatchMode.chooseStartingPlayer &&
      matchService.getCurrentPlayer() === playerStateService.getPlayerId()
    );
  }

  function isSelectingStartingStationCards() {
    return matchService.mode() === MatchMode.selectStationCards;
  }

  function selectingStartingStationCards() {
    const canPutDownMoreStationCards = playerRuleService.canPutDownMoreStartingStationCards();
    if (canPutDownMoreStationCards) {
      const cardsOnHand = playerStateService.getCardsOnHand();
      const location = locationForStartingStationCard();
      matchController.emit("selectStartingStationCard", {
        cardId: cardsOnHand[0].id,
        location,
      });
    } else if (!playerCommanders.hasSelectedSomeCommander()) {
      let commander = Commander.FrankJohnson;

      if (playerStateService.getPlayerState().currentDeck === "TheSwarm") {
        const swarmCommander = [Commander.Crakux, Commander.Zuuls];
        commander = swarmCommander[Math.floor(Math.random() * 2)];
      }

      matchController.emit("selectCommander", {
        commander: commander,
      });
    } else if (!playerStateService.isReadyForGame()) {
      matchController.emit("playerReady");
    }
  }

  function locationForStartingStationCard() {
    const cardsSelected = playerRuleService.amountOfStartingStationCardsSelected();
    if (cardsSelected === 0) {
      return "draw";
    } else if (cardsSelected === 1) {
      return "action";
    } else if (cardsSelected === 2) {
      return "handSize";
    } else {
      return "action";
    }
  }

  function choosingStartingPlayer() {
    matchController.emit("selectPlayerToStart", {
      playerToStartId: playerStateService.getPlayerId(),
    });
  }

  function damageOpponentStationCards() {
    const targetIds = opponentStateService
      .getUnflippedStationCards()
      .slice(0, getDamageStationCardRequirementCount())
      .map((c) => c.id);
    matchController.emit("damageStationCards", { targetIds });
  }

  function hasRequirementOfType(type) {
    return !!getRequirementOfType(type);
  }

  function getDamageStationCardRequirementCount() {
    return getRequirementOfType("damageStationCard").count;
  }

  function getRequirementOfType(type) {
    return queryPlayerRequirements.getFirstMatchingRequirement({ type });
  }

  function hasAnyRequirements() {
    return queryPlayerRequirements.hasAnyRequirements();
  }

  function performRequirement() {
    if (hasRequirementOfType("drawCard")) {
      matchController.emit("drawCard");
    } else if (hasRequirementOfType("discardCard")) {
      matchController.emit("discardCard", decideCardToDiscard());
    } else if (hasRequirementOfType("damageStationCard")) {
      damageOpponentStationCards();
    } else if (hasRequirementOfType("sacrifice")) {
      matchController.emit(
        "sacrificeCardForRequirement",
        decideCardToSacrifice()
      );
    } else if (hasRequirementOfType("findCard")) {
      const findRequirement = getRequirementOfType("findCard");
      if (
        findRequirement.cardCommonId &&
        findRequirement.cardCommonId === Fusion.CommonId
      ) {
        fusionRequirementResolver(findRequirement);
      } else {
        matchController.emit("selectCardForFindCardRequirement", {
          cardGroups: getCardGroup(findRequirement),
        });
      }
    } else if (hasRequirementOfType("damageShieldCard")) {
      const damageShieldCardRequirement = getRequirementOfType(
        "damageShieldCard"
      );
      matchController.emit("damageShieldCards", {
        targetIds: getTargetShields(damageShieldCardRequirement),
      });
    }
  }

  function getTargetShields(damageShieldCardRequirement) {
    const opponentShields = opponentStateService
      .getMatchingBehaviourCards((card) => card.stopsStationAttack())
      .slice(0, damageShieldCardRequirement.count);

    return opponentShields.map((card) => card.id);
  }

  //TODO: extra me to a command, test me, and clean me
  function fusionRequirementResolver(findRequirement) {
    if (findRequirement.target === "discardPile") {
      const groupSelection = {
        source: findRequirement.cardGroups[0].source,
        cardIds: [],
      };
      const currentCardsAtZone = findRequirement.cardGroups[0].cards
        .map((card) => playerStateService.createBehaviourCard(card))
        .sort((cardA, cardB) => {
          const cardAScore = scoreCard(cardA);
          const cardBScore = scoreCard(cardB);
          return cardAScore - cardBScore;
        });
      groupSelection.cardIds.push(
        currentCardsAtZone[0].id,
        currentCardsAtZone[1].id
      );

      matchController.emit("selectCardForFindCardRequirement", {
        cardGroups: [groupSelection],
      });
    } else if (findRequirement.target === "currentCardZone") {
      const cardsInDeck = findRequirement.cardGroups[0];
      const carrier = cardsInDeck.cards.find(
        (card) => card.commonId === Carrier.CommonId
      );
      const groupSelection = { source: cardsInDeck.source, cardIds: [] };
      if (carrier) {
        groupSelection.cardIds.push(carrier.id);
      } else {
        const cardNotDrone = cardsInDeck.cards.filter(
          (card) => card.commonId !== Drone.CommonId
        )[0];
        groupSelection.cardIds.push(cardNotDrone.id);
      }
      matchController.emit("selectCardForFindCardRequirement", {
        cardGroups: groupSelection,
      });
    }
  }

  function scoreCard(card) {
    return (
      (card.canAttack() ? 0 : 1) + (card.commonId !== Drone.CommonId ? 1 : 0)
    );
  }

  //TODO : here we should do

  function getCardGroup(requirement) {
    let cardsLeft = requirement.count;
    const result = [];
    requirement.cardGroups.forEach((group) => {
      if (group.cards.length > 0) {
        const groupSelection = { source: group.source, cardIds: [] };
        group.cards.forEach((card) => {
          if (cardsLeft !== 0) {
            groupSelection.cardIds.push(card.id);
            cardsLeft--;
          }
        });
        result.push(groupSelection);
      }
    });

    return result;
  }
};
