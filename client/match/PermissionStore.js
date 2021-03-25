const canIssueOverwork = require("../../shared/match/overwork/canIssueOverwork.js");
const canExchangeActionPointsForDrawExtraCard = require("../../shared/match/actionPointsForDrawExtraCard/canExchangeActionPointsForDrawExtraCard.js");

module.exports = function (deps) {
  const { getFrom } = deps;

  return {
    name: "permission",
    namespaced: true,
    state: {},
    getters: {
      isOwnTurn,
      opponentHasControlOfPlayersTurn,
      playerHasControlOfOpponentsTurn,
      waitingForOtherPlayerToFinishRequirements,
      canMoveCardsFromHand,
      canDiscardCards,
      canDiscardActivateDurationCards,
      canReplaceCards,
      canPutDownCards,
      canPutDownStationCards,
      canPutDownMoreStationCardsThisTurn,
      canPutDownMoreStartingStationCards,
      canSelectStationCards,
      canSelectShieldCardsForRequirement,
      canSelectCardsForActiveAction,
      canPutDownStationCardInHomeZone,
      canSelectForSacrificeRequirement,
      canSelectCardForDamageSpaceshipRequirement,
      canIssueOverwork: canIssueOverworkGetter,
      canExchangeActionPointsForDrawExtraCard: canExchangeActionPointsForDrawExtraCardGetter,
      canDrawCards,
      shouldShowWindowedOverlayByDrawCard,
      canPassDrawPhase,
      canMill,
      deckIsEmpty,
      opponentDeckIsEmpty,
    },
    actions: {},
  };

  function isOwnTurn(state, getters, rootState) {
    //TODO "isOwnTurn" is confusing as you can take control of another players turn, this would be true then but it wouldnt be "your turn".
    const matchState = rootState.match;
    return matchState.ownUser.id === matchState.currentPlayer;
  }

  function opponentHasControlOfPlayersTurn(
    state,
    getters,
    rootState,
    rootGetters
  ) {
    return rootGetters["match/turnControl"].opponentHasControlOfPlayersTurn();
  }

  function playerHasControlOfOpponentsTurn(
    state,
    getters,
    rootState,
    rootGetters
  ) {
    return rootGetters["match/turnControl"].playerHasControlOfOpponentsTurn();
  }

  function waitingForOtherPlayerToFinishRequirements() {
    return getFrom("waitingForOtherPlayerToFinishRequirements", "requirement");
  }

  function deckIsEmpty(state, getters, rootState) {
    return rootState.match.playerCardsInDeckCount <= 0;
  }

  function opponentDeckIsEmpty(state, getters, rootState) {
    return rootState.match.opponentCardsInDeckCount <= 0;
  }

  function canMoveCardsFromHand(state, getters, rootState, rootGetters) {
    if (getters.canPutDownMoreStartingStationCards) return true;
    if (getters.waitingForOtherPlayerToFinishRequirements) return false;

    const hasActiveRequirement = !!getFrom("firstRequirement", "requirement");
    return (
      !rootGetters["match/gameOn"] || getters.isOwnTurn || hasActiveRequirement
    );
  }

  function canDiscardCards(state, getters, rootState, rootGetters) {
    return rootGetters["match/playerRuleService"].canDiscardCards();
  }

  function canDiscardActivateDurationCards(
    state,
    getters,
    rootState,
    rootGetters
  ) {
    return rootGetters[
      "match/playerRuleService"
    ].canDiscardActivateDurationCards();
  }

  function canReplaceCards(state, getters, rootState, rootGetters) {
    return rootGetters["match/playerRuleService"].canReplaceCards();
  }

  function canPutDownCards(state, getters, rootState, rootGetters) {
    return rootGetters["match/playerRuleService"].canPutDownCardsInHomeZone();
  }

  function canPutDownStationCards(state, getters, rootState, rootGetters) {
    return rootGetters["match/playerRuleService"].canPutDownStationCards();
  }

  function canPutDownMoreStationCardsThisTurn(
    state,
    getters,
    rootState,
    rootGetters
  ) {
    return rootGetters[
      "match/playerRuleService"
    ].canPutDownMoreStationCardsThisTurn();
  }

  function canPutDownMoreStartingStationCards(
    state,
    getters,
    rootState,
    rootGetters
  ) {
    return rootGetters[
      "match/playerRuleService"
    ].canPutDownMoreStartingStationCards();
  }

  function canPutDownStationCardInHomeZone(
    state,
    getters,
    rootState,
    rootGetters
  ) {
    return (
      rootGetters["match/playerRuleService"].canPutDownCardsInHomeZone() &&
      !rootState.card.activeAction
    );
  }

  function canExchangeActionPointsForDrawExtraCardGetter(state, getters, rootState, rootGetters) {
    console.log(rootGetters["match/actionPointsForDrawExtraCardEnabled"], canExchangeActionPointsForDrawExtraCard({
      playerId: rootState.match.ownUser.id,
      currentPlayer: rootState.match.currentPlayer,
      unflippedStationCardCount:
        rootGetters["match/playerUnflippedStationCardCount"],
      phase: rootState.match.phase,
      hasRequirements: rootState.match.requirements.length > 0,
    }));
    return (
      rootGetters["match/actionPointsForDrawExtraCardEnabled"] &&
      canExchangeActionPointsForDrawExtraCard({
        playerId: rootState.match.ownUser.id,
        currentPlayer: rootState.match.currentPlayer,
        actionPoints: rootGetters["match/actionPoints2"],
        phase: rootState.match.phase,
        hasRequirements: rootState.match.requirements.length > 0,
      })
    );
  }

  function canIssueOverworkGetter(state, getters, rootState, rootGetters) {
    return (
      rootGetters["match/overworkEnabled"] &&
      canIssueOverwork({
        playerId: rootState.match.ownUser.id,
        currentPlayer: rootState.match.currentPlayer,
        unflippedStationCardCount:
          rootGetters["match/playerUnflippedStationCardCount"],
        phase: rootState.match.phase,
        hasRequirements: rootState.match.requirements.length > 0,
      })
    );
  }

  function canSelectStationCards(state, getters) {
    //TODO Rename "canSelectStationCardsForRequirement"
    if (getters.waitingForOtherPlayerToFinishRequirements) return false;

    const damageStationCardRequirement = getFrom(
      "firstRequirementIsDamageStationCard",
      "requirement"
    );
    const cardsLeftToSelect = getFrom("cardsLeftToSelect", "requirement");
    return damageStationCardRequirement && cardsLeftToSelect > 0;
  }
  function canSelectShieldCardsForRequirement(state, getters) {
    if (getters.waitingForOtherPlayerToFinishRequirements) return false;

    const damageShieldCardRequirement = getFrom(
      "firstRequirementIsDamageShieldCard",
      "requirement"
    );
    const cardsLeftToSelect = getFrom("cardsLeftToSelect", "requirement");

    return damageShieldCardRequirement && cardsLeftToSelect > 0;
  }

  function canSelectCardsForActiveAction(state, getters, rootState) {
    const activeAction = rootState.card.activeAction;
    if (!activeAction) return false;

    return ["destroyAnyCard", "sacrifice"].includes(activeAction.name);
  }

  function canDrawCards(state, getters, rootState, rootGetters) {
    return rootGetters["match/playerRuleService"].canDrawCards();
  }

  function canPassDrawPhase(state, getters, rootState, rootGetters) {
    return rootGetters["match/playerDrawPhase"].canPass();
  }

  function canMill(state, getters, rootState, rootGetters) {
    return rootGetters["match/miller"].canMill();
  }

  function canSelectForSacrificeRequirement(state, getters) {
    if (getters.waitingForOtherPlayerToFinishRequirements) return false;
    const selectForSacrificeRequirement = getFrom(
      "firstRequirementIsSelectForSacrifice",
      "requirement"
    );
    const cardsLeftToSelect = getFrom("cardsLeftToSelect", "requirement");

    return selectForSacrificeRequirement && cardsLeftToSelect > 0;
  }
  function canSelectCardForDamageSpaceshipRequirement(state, getters) {
    if (getters.waitingForOtherPlayerToFinishRequirements) return false;
    const selectCardForDamageSpaceship = getFrom(
      "firstRequirementIsSelectSpaceshipForDamage",
      "requirement"
    );
    const cardsLeftToSelect = getFrom("cardsLeftToSelect", "requirement");

    return selectCardForDamageSpaceship && cardsLeftToSelect > 0;
  }

  function shouldShowWindowedOverlayByDrawCard(
    state,
    getters,
    rootState,
    rootGetters
  ) {
    const pickCardOverlayForDroneCard =
      (JSON.parse(localStorage.getItem("pickCardOverlayForAll")) || {})
        .value === "true";
    if (pickCardOverlayForDroneCard) {
      const requirementIsCancelable = getFrom(
        "requirementIsCancelable",
        "requirement"
      );
      const firstRequirementIsDrawCard = getFrom(
        "firstRequirementIsDrawCard",
        "requirement"
      );
      return (
        rootGetters["match/playerRuleService"].canDrawCards() &&
        requirementIsCancelable &&
        firstRequirementIsDrawCard
      );
    } else {
      return rootGetters["match/playerRuleService"].canDrawCards();
    }
  }
};
