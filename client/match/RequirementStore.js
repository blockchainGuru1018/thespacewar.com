module.exports = function ({ rootStore, cardInfoRepository, matchController }) {
  return {
    name: "requirement",
    namespaced: true,
    state: {
      selectedStationCardIdsForRequirement: [],
      selectedCardForSacrificeForRequirement: [],
    },
    getters: {
      waitingForOtherPlayerToFinishRequirements,
      waitingRequirement,
      firstRequirement,
      firstRequirementIsDiscardCard,
      firstRequirementIsDamageStationCard,
      firstRequirementIsDamageShieldCard,
      firstRequirementIsDrawCard,
      firstRequirementIsFindCard,
      firstRequirementIsCounterCard,
      firstRequirementIsCounterAttack,
      firstRequirementIsSelectForSacrifice,
      firstRequirementIsSelectSpaceshipForDamage,
      countInFirstRequirement,
      selectedCardsCount,
      firstRequirementMoveCardToStationZone,
      cardsLeftToSelect,
      attackerRequirement,
      requirementCardImageUrl,
      requirementIsCancelable,
      _firstCardIdThatCanLookAtHandSizeStationRow,
    },
    actions: {
      selectStationCardForRequirement,
      selectCardForSacrificeForRequirement,
      lookAtHandSizeStationRow,
      cancelRequirement,
    },
  };

  function waitingForOtherPlayerToFinishRequirements(state, getters) {
    return !!getters.waitingRequirement;
  }

  function waitingRequirement(state, getters, rootState) {
    return rootState.match.requirements.find((r) => r.waiting);
  }

  function firstRequirement(state, getters, rootState) {
    const requirements = rootState.match.requirements.slice();

    if (requirements.length === 0) return null;
    return requirements[0];
  }

  function firstRequirementIsDiscardCard(state, getters) {
    return (
      getters.firstRequirement &&
      getters.firstRequirement.type === "discardCard"
    );
  }

  function firstRequirementIsDamageStationCard(state, getters) {
    return (
      getters.firstRequirement &&
      getters.firstRequirement.type === "damageStationCard"
    );
  }

  function firstRequirementIsDamageShieldCard(state, getters) {
    const isFirstRequirementIsDamageShieldCard =
      getters.firstRequirement &&
      getters.firstRequirement.type === "damageShieldCard";
    return isFirstRequirementIsDamageShieldCard;
  }

  function firstRequirementIsDrawCard(state, getters) {
    return (
      getters.firstRequirement && getters.firstRequirement.type === "drawCard"
    );
  }

  function firstRequirementIsFindCard(state, getters) {
    return (
      getters.firstRequirement && getters.firstRequirement.type === "findCard"
    );
  }

  function firstRequirementMoveCardToStationZone(state, getters) {
    return (
      getters.firstRequirement &&
      getters.firstRequirement.type === "moveCardToStationZone"
    );
  }

  function firstRequirementIsCounterCard(state, getters) {
    return (
      getters.firstRequirement &&
      getters.firstRequirement.type === "counterCard"
    );
  }

  function firstRequirementIsCounterAttack(state, getters) {
    return (
      getters.firstRequirement &&
      getters.firstRequirement.type === "counterAttack"
    );
  }

  function firstRequirementIsSelectForSacrifice(state, getters) {
    return (
      getters.firstRequirement && getters.firstRequirement.type === "sacrifice"
    );
  }

  function firstRequirementIsSelectSpaceshipForDamage(state, getters) {
    return (
      getters.firstRequirement &&
      getters.firstRequirement.type === "damageSpaceship"
    );
  }

  function countInFirstRequirement(state, getters) {
    return getters.firstRequirement && getters.firstRequirement.count;
  }

  function selectedCardsCount(state, getters) {
    return getters.firstRequirementIsDamageStationCard
      ? state.selectedStationCardIdsForRequirement.length
      : 0;
  }

  function cardsLeftToSelect(state, getters) {
    return getters.countInFirstRequirement - getters.selectedCardsCount;
  }

  function attackerRequirement(state, getters) {
    return getters.firstRequirement.cardCommonId;
  }

  function requirementCardImageUrl(state, getters) {
    const firstRequirement = getters.firstRequirement;
    if (!firstRequirement || !firstRequirement.cardCommonId) return "";
    return cardInfoRepository.getImageUrl(firstRequirement.cardCommonId);
  }

  function requirementIsCancelable(state, getters) {
    return getters.firstRequirement && getters.firstRequirement.cancelable;
  }

  function _firstCardIdThatCanLookAtHandSizeStationRow(
    state,
    getters,
    rootState,
    rootGetters
  ) {
    const cards = rootGetters["match/cardsThatCanLookAtHandSizeStationRow"]();
    const firstCard = cards[0];
    return firstCard.id;
  }

  function selectStationCardForRequirement({ state, getters }, stationCard) {
    state.selectedStationCardIdsForRequirement.push(stationCard.id);
    if (getters.cardsLeftToSelect === 0) {
      const targetIds = state.selectedStationCardIdsForRequirement.slice();
      state.selectedStationCardIdsForRequirement = [];

      rootStore.dispatch("match/damageStationCards", targetIds);
    }
  }

  function selectCardForSacrificeForRequirement({ state, getters }, payload) {
    state.selectedCardForSacrificeForRequirement.push(payload.card.id);
    const targetIds = state.selectedCardForSacrificeForRequirement.slice();
    state.selectedCardForSacrificeForRequirement = [];

    rootStore.dispatch("match/sacrificeCardForRequirement", targetIds);
  }

  function lookAtHandSizeStationRow({ getters }) {
    const cardId = getters["_firstCardIdThatCanLookAtHandSizeStationRow"];
    matchController.emit("lookAtStationRow", {
      stationRow: "handSize",
      cardId,
    });
  }

  function cancelRequirement({}) {
    matchController.emit("cancelRequirement");
  }
};
