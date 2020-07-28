const Vue = require("vue");
const PutDownCardEvent = require("../../shared/PutDownCardEvent.js");
const TheDarkDestroyer = require("../../shared/card/TheDarkDestroyer.js");
const Avoid = require("../../shared/card/Avoid.js");
const FatalError = require("../../shared/card/FatalError.js");
const falsyOp = () => false;

module.exports = function (deps) {
  const { matchController, getFrom, cardInfoRepository, rootDispatch } = deps;

  let onActiveActionFinish = null;

  return {
    namespaced: true,
    name: "card",
    state: {
      holdingCard: null,
      draggingCard: false, //todo this flag relates to above data "holdingCard", but might it be confused as to be data itself and not a boolean?

      //choice dialog
      choiceCardId: null,

      //active action
      activeActionCardData: null,
      activeAction: null,
      selectedCardIdsForAction: [],
      checkIfCanBeSelectedForAction: falsyOp,

      // utils/transient cards
      transientPlayerCardsInHomeZone: [],
      hiddenCardIdsOnHand: [],
      hiddenStationCardIds: [],

      // ghosts
      showOnlyCardGhostsFor: null,
    },
    mutations: {
      SET_HOLDING_CARD,
    },
    getters: {
      //choice dialog
      choiceCardData,
      choices,

      //active action
      activeActionName,
      activeActionCard,
      activeActionCardImageUrl,
      canSelectMoreCardsForAction,

      // Move station card
      movingStationCard,
    },
    actions: {
      // Utils/Transient cards
      moveCardToZoneAsTransient,
      removeTransientCard,
      // Card choices todo move to it's own separate store?
      showChoiceDialog,
      choiceDialogApplyChoice,
      _applyChoicePutDownAsExtraStationCard,
      choiceDialogCancel,
      _hideChoiceDialog,

      // Card action todo move to it's own separate store?
      showPutDownCardAction,
      selectGhostForActiveAction,
      showCardAction,
      selectCardForActiveAction,
      cancelCardAction,

      // Sacrifice todo move to it's own separate store?
      startSacrifice,
      _completeSacrifice,

      // Trigger dormant effect todo move to it's own separate store?
      triggerDormantEffect,

      // PutDownCard todo move to it's own separate store?
      putDownCardOrShowChoiceOrAction,
      putDownCardAsExtraStationCard,
      putDownCard,
      _removeCardLocal,
      _putDownCardLocal,
      _addPutDownCardEvent,

      // Select starting station card
      selectStartingStationCard,

      // Move station card
      startMovingStationCard,
      moveHoldingStationCard,

      //Holding card
      putDownHoldingCard,
      discardHoldingCard,
      startHoldingCard,
      cancelHoldingCard,

      //Misc
      cancelCurrentUserInteraction,
      getCardDataByCommonId,
    },
  };

  function SET_HOLDING_CARD(state, holdingCard) {
    state.holdingCard = holdingCard;
  }

  function choiceCardData(state, getters, rootState, rootGetters) {
    return rootGetters["match/findPlayerCardFromAllSources"](
      state.choiceCardId
    );
  }

  function choices(state, getters, rootState, rootGetters) {
    if (!state.choiceCardId) return [];
    const card = rootGetters["match/createCard"](getters.choiceCardData);
    return card.choicesWhenPutDownInHomeZone;
  }

  function activeActionName(state) {
    return state.activeAction ? state.activeAction.name : "";
  }

  function activeActionCard(state, getters, rootState, rootGetters) {
    if (!state.activeActionCardData) return null;
    return rootGetters["match/createCard"](state.activeActionCardData);
  }

  function activeActionCardImageUrl(state) {
    if (!state.activeActionCardData) return "";

    if (state.activeAction.showCardImage) {
      return cardInfoRepository.getImageUrl(
        state.activeActionCardData.commonId
      );
    } else {
      return "";
    }
  }

  function getCardDataByCommonId(state, commonId) {
    return cardInfoRepository.getCard(commonId);
  }

  function canSelectMoreCardsForAction(state, getters, rootState, rootGetters) {
    if (!state.activeAction) return false;

    if (state.activeAction.name === "sacrifice") {
      const opponentStationCards = rootGetters["match/allOpponentStationCards"];
      const selectedStationCardCount = state.selectedCardIdsForAction.filter(
        (id) => opponentStationCards.some((s) => s.id === id)
      ).length;

      const hasSelectedOneCardFromAZone =
        state.selectedCardIdsForAction.length === 1 &&
        selectedStationCardCount === 0;
      if (hasSelectedOneCardFromAZone) {
        return false;
      }

      const unflippedOpponentStationCardCount = opponentStationCards.filter(
        (s) => !s.flipped
      ).length;
      const isLessThanLimitAndHasMoreCardsToPickFrom =
        selectedStationCardCount < 4 &&
        selectedStationCardCount < unflippedOpponentStationCardCount;

      return isLessThanLimitAndHasMoreCardsToPickFrom;
    } else {
      return false;
    }
  }

  function movingStationCard(state, getters, rootState, rootGetters) {
    const holdingCard = state.holdingCard;
    if (!holdingCard) return false;

    return rootGetters["match/allPlayerStationCards"].some(
      (stationCard) => stationCard.id === holdingCard.id
    );
  }

  function moveCardToZoneAsTransient({ state }, cardData) {
    state.transientPlayerCardsInHomeZone.push(cardData);
    state.hiddenCardIdsOnHand.push(cardData.id);
    state.hiddenStationCardIds.push(cardData.id);
  }

  function removeTransientCard({ state }, cardId) {
    state.hiddenCardIdsOnHand = state.hiddenCardIdsOnHand.filter(
      (id) => id !== cardId
    );
    state.hiddenStationCardIds = state.hiddenStationCardIds.filter(
      (id) => id !== cardId
    );
    state.transientPlayerCardsInHomeZone = state.transientPlayerCardsInHomeZone.filter(
      (c) => c.id !== cardId
    );
  }

  function startSacrifice({ state, dispatch, rootState, rootGetters }, cardId) {
    const cardData = rootGetters["match/findPlayerCardFromAllSources"](cardId);
    dispatch("showCardAction", {
      cardData,
      action: {
        showCardImage: false,
        name: "sacrifice",
      },
      checkIfCanBeSelectedForAction: (
        activeCard,
        { cardData, isStationCard, isOpponentCard }
      ) => {
        //TODO Can this be a getter function based on the current active action name?
        if (!isOpponentCard) return false;
        if (!isStationCard && state.selectedCardIdsForAction.length > 0)
          return false;

        const card = rootGetters["match/createCard"](cardData, {
          isOpponent: isOpponentCard,
        });

        if (isStationCard) {
          if (activeCard.isInHomeZone()) return false;
          if (cardData.flipped) return false;

          const someCardStopsAttacks = rootState.match.opponentCardsInZone.some(
            (c) => rootGetters["match/createCard"](c).stopsStationAttack()
          );
          if (someCardStopsAttacks) return false;
          return activeCard.canTargetCardForSacrifice(card);
        } else {
          return activeCard.canTargetCardForSacrifice(card);
        }
      },
      onFinish: (targetCardIds) =>
        dispatch("_completeSacrifice", { cardId, targetCardIds }),
    });
  }

  function _completeSacrifice({ rootGetters }, { cardId, targetCardIds }) {
    const opponentStationCards = rootGetters["match/allOpponentStationCards"];
    const firstCardIsStationCard = opponentStationCards.some(
      (s) => s.id === targetCardIds[0]
    );
    if (targetCardIds.length === 1 && !firstCardIsStationCard) {
      matchController.emit("sacrifice", {
        cardId,
        targetCardId: targetCardIds[0],
      });
    } else {
      matchController.emit("sacrifice", { cardId, targetCardIds });
    }
  }

  function triggerDormantEffect(actionContext, cardId) {
    matchController.emit("triggerDormantEffect", cardId);
  }

  function showChoiceDialog({ state, dispatch }, cardData) {
    dispatch("moveCardToZoneAsTransient", cardData);
    state.choiceCardId = cardData.id;
  }

  function choiceDialogCancel({ dispatch }) {
    dispatch("_hideChoiceDialog");
  }

  async function choiceDialogApplyChoice({ state, getters, dispatch }, choice) {
    rootDispatch.loadingIndicator.show();

    const cardId = state.choiceCardId;
    const cardData = getters.choiceCardData;
    const choices = getters.choices;
    dispatch("_hideChoiceDialog");

    if (choice === "putDownAsExtraStationCard") {
      const choiceData = choices.find(
        (c) => c.name === "putDownAsExtraStationCard"
      );
      dispatch("_applyChoicePutDownAsExtraStationCard", {
        cardData,
        choiceData,
      });
    } else {
      await dispatch("putDownCard", { location: "zone", choice, cardData });
    }

    dispatch("removeTransientCard", cardId);
    rootDispatch.loadingIndicator.hide();
  }

  async function _applyChoicePutDownAsExtraStationCard(
    { dispatch },
    { cardData, choiceData }
  ) {
    await Vue.nextTick(); //WORKAROUND: Wait for click event to bubble up so that it wont cancel the action set below

    dispatch("showPutDownCardAction", {
      cardData: cardData,
      action: choiceData.action,
      onFinish: (location) =>
        dispatch("putDownCardAsExtraStationCard", { cardData, location }),
      showOnlyCardGhostsFor: ["playerStation"],
      setHiddenStationCardIds: [choiceData.id],
    });
  }

  function showCardAction(
    { state, getters, dispatch },
    { cardData, action, checkIfCanBeSelectedForAction, onFinish }
  ) {
    onActiveActionFinish = onFinish;
    if (action.showTransientCardInHomeZone) {
      dispatch("moveCardToZoneAsTransient", cardData);
    }
    state.activeActionCardData = cardData;
    state.activeAction = action;

    state.checkIfCanBeSelectedForAction = (options) => {
      return checkIfCanBeSelectedForAction(getters.activeActionCard, options);
    };
  }

  async function selectCardForActiveAction(
    { state, getters, dispatch },
    targetCardId
  ) {
    state.selectedCardIdsForAction.push(targetCardId);
    if (getters.canSelectMoreCardsForAction) return;

    rootDispatch.loadingIndicator.show();
    await onActiveActionFinish(state.selectedCardIdsForAction);
    rootDispatch.loadingIndicator.hide();

    dispatch("cancelCardAction");
  }

  function showPutDownCardAction(
    { state, dispatch },
    {
      action,
      cardData,
      onFinish,
      showOnlyCardGhostsFor = null,
      hideStationCardIds = [],
    }
  ) {
    onActiveActionFinish = onFinish;

    state.activeActionCardData = cardData;
    state.activeAction = action;

    state.hiddenStationCardIdsForAction = hideStationCardIds;
    state.hiddenStationCardIds.push(...hideStationCardIds);

    dispatch("startHoldingCard", { cardData, showOnlyCardGhostsFor });
  }

  async function selectGhostForActiveAction({ dispatch }, location) {
    rootDispatch.loadingIndicator.show();
    await onActiveActionFinish(location);
    rootDispatch.loadingIndicator.hide();

    dispatch("cancelCardAction");
  }

  function cancelCardAction({ state, dispatch }) {
    onActiveActionFinish = null;

    if (state.activeActionCardData) {
      dispatch("removeTransientCard", state.activeActionCardData.id);
    }

    state.activeActionCardData = null;
    state.activeAction = null;

    state.checkIfCanBeSelectedForAction = falsyOp;

    state.selectedCardIdsForAction = [];

    state.hiddenStationCardIds = state.hiddenStationCardIds.filter(
      (id) => !state.hiddenStationCardIdsForAction.includes(id)
    );
    state.hiddenStationCardIdsForAction = [];

    if (state.holdingCard) {
      dispatch("cancelHoldingCard");
    }
  }

  function startMovingStationCard({ dispatch }, { stationCard }) {
    const options = { showOnlyCardGhostsFor: "playerStation" };
    if (stationCard.flipped) {
      options.cardData = stationCard.card;
    } else {
      options.id = stationCard.id;
    }
    dispatch("startHoldingCard", options);
  }

  function moveHoldingStationCard({ state, dispatch }, { location }) {
    const cardId = state.holdingCard.id;
    matchController.emit("moveStationCard", { cardId, location });
    dispatch("cancelHoldingCard");
  }

  function putDownHoldingCard({ state, dispatch }, { location }) {
    const cardData = state.holdingCard;
    dispatch("cancelHoldingCard");
    dispatch("putDownCardOrShowChoiceOrAction", { location, cardData });
  }

  function putDownCardOrShowChoiceOrAction(
    { dispatch, rootGetters },
    { location, cardData }
  ) {
    const card = rootGetters["match/createCard"](cardData);

    if (location === "zone" && card.choicesWhenPutDownInHomeZone) {
      dispatch("showChoiceDialog", cardData);
    } else if (location === "zone" && card.actionWhenPutDownInHomeZone) {
      dispatch("showCardAction", {
        cardData,
        action: card.actionWhenPutDownInHomeZone,
        useTransientCard: true,
        checkIfCanBeSelectedForAction: (
          actionCard,
          { cardData, isOpponentCard }
        ) => {
          //Avoid would always be used to counter when TheDarkDestroyer was played and used to destroy Avoid,
          // instead of implementing a way for the player to activate avoid we choose to make it impossible to select
          // Avoid as card to destroy when playing TheDarkDestroyer
          if (
            actionCard.commonId === TheDarkDestroyer.CommonId &&
            cardData.commonId === Avoid.CommonId
          )
            return false;

          //Has not implemented an "Action" for TheDarkDestroyer as I have for Fatal Error
          if (actionCard.commonId === TheDarkDestroyer.CommonId) {
            return isOpponentCard;
          } else {
            const opponentCard = rootGetters["match/createCard"](cardData, {
              isOpponent: isOpponentCard,
            });
            if (card.commonId === FatalError.CommonId) {
              const actionPoints = rootGetters[
                "match/playerActionPointsCalculator"
              ].calculate();
              return card.actionWhenPutDownInHomeZone.validTarget(
                opponentCard,
                actionPoints
              );
            } else {
              return card.actionWhenPutDownInHomeZone.validTarget(opponentCard);
            }
          }
        },

        onFinish: (targetCardIds) =>
          dispatch("putDownCard", {
            location,
            cardData,
            choice: targetCardIds[0],
          }),
      });
    } else {
      dispatch("putDownCard", { location, cardData });
    }
  }

  async function putDownCardAsExtraStationCard(
    { dispatch,rootGetters },
    { cardData, location }
  ) {
    const choice = "putDownAsExtraStationCard";

    dispatch("_removeCardLocal", cardData.id);
    dispatch("_addPutDownCardEvent", {
      location,
      cardData,
      putDownAsExtraStationCard: true,
    });
    dispatch("_putDownCardLocal", { location, cardData });
    const card = rootGetters["match/createCard"](cardData);
    putDownCardRemote({
      location,
      cardId: cardData.id,
      cardCost: card.costToPlay,
      choice,
    });
  }

  async function putDownCard(
    { dispatch, rootGetters },
    { cardData, choice = null, location }
  ) {
    dispatch("_removeCardLocal", cardData.id);
    dispatch("_addPutDownCardEvent", { location, cardData });
    dispatch("_putDownCardLocal", { location, cardData });
    const card = rootGetters["match/createCard"](cardData);

    putDownCardRemote({
      location,
      cardId: cardData.id,
      cardCost: card.costToPlay,
      choice,
    });
  }

  async function _removeCardLocal({ rootState, commit }, cardId) {
    const matchState = rootState.match;
    const cardIndexOnHand = matchState.playerCardsOnHand.findIndex(
      (c) => c.id === cardId
    );
    const cardOnHand = matchState.playerCardsOnHand[cardIndexOnHand];
    const allPlayerStationCards = getFrom("allPlayerStationCards", "match");
    const stationCard = allPlayerStationCards.find((s) => s.id === cardId);

    if (cardOnHand) {
      matchState.playerCardsOnHand.splice(cardIndexOnHand, 1);
    } else if (stationCard) {
      commit(
        "match/setPlayerStationCards",
        allPlayerStationCards.filter((s) => s.id !== cardId),
        { root: true }
      );
    }
  }

  async function _putDownCardLocal(
    { rootState, dispatch },
    { location, cardData }
  ) {
    //TODO Should not directly modify another modules state
    const matchState = rootState.match;

    if (location.startsWith("station")) {
      if (location === "station-draw") {
        matchState.playerStation.drawCards.push(cardData);
      } else if (location === "station-action") {
        matchState.playerStation.actionCards.push(cardData);
      } else if (location === "station-handSize") {
        matchState.playerStation.handSizeCards.push(cardData);
      }
    } else if (location === "zone") {
      if (cardData.type === "event") {
        matchState.playerDiscardedCards.push(cardData);
      } else {
        dispatch("match/placeCardInZone", cardData, { root: true });
      }
    }
  }

  function _addPutDownCardEvent(
    { rootState, rootGetters },
    { location, cardData, putDownAsExtraStationCard = false }
  ) {
    const matchState = rootState.match;
    const eventFactory = rootGetters["match/eventFactory"];
    const card = rootGetters["match/createCard"](cardData);

    card.eventSpecsWhenPutDownInHomeZone
      .map(eventFactory.fromSpec)
      .forEach((event) => {
        matchState.events.push(event);
      });

    matchState.events.push(
      PutDownCardEvent({
        turn: matchState.turn,
        location,
        cardId: cardData.id,
        cardCommonId: cardData.commonId,
        putDownAsExtraStationCard,
        cardCost: card.costToPlay,
      })
    );
  }

  function selectStartingStationCard({ dispatch }, { location, cardId }) {
    matchController.emit("selectStartingStationCard", { location, cardId });
    dispatch("cancelHoldingCard");
  }

  function putDownCardRemote({ location, cardId, choice, cardCost }) {
    matchController.emit("putDownCard", { location, cardId, cardCost, choice });
  }

  function discardHoldingCard({ state, dispatch }) {
    dispatch("match/discardCard", state.holdingCard.id, { root: true });
    dispatch("cancelHoldingCard");
  }

  function cancelCurrentUserInteraction({ state, rootState, dispatch }) {
    if (rootState.match.attackerCardId) {
      dispatch("match/cancelAttack", null, { root: true });
    } else if (rootState.match.repairerCardId) {
      dispatch("match/cancelRepair", null, { root: true });
    } else if (state.activeAction) {
      dispatch("cancelCardAction");
    } else if (state.holdingCard) {
      dispatch("cancelHoldingCard");
    } else if (state.choiceCardId) {
      dispatch("choiceDialogCancel");
    }
  }

  function startHoldingCard(
    { state, commit },
    {
      id = null,
      cardData = null,
      showOnlyCardGhostsFor = null,
      dragging = false,
    }
  ) {
    state.showOnlyCardGhostsFor = showOnlyCardGhostsFor;
    state.draggingCard = dragging;
    commit("SET_HOLDING_CARD", cardData || { id, faceDown: true });
  }

  function cancelHoldingCard({ state, commit }) {
    state.showOnlyCardGhostsFor = null;

    state.draggingCard = false;
    if (state.holdingCard) {
      const holdingCardId = state.holdingCard.id;
      state.hiddenStationCardIds = state.hiddenStationCardIds.filter(
        (id) => id !== holdingCardId
      );
      commit("SET_HOLDING_CARD", null);
    }
  }

  function _hideChoiceDialog({ state, dispatch }) {
    dispatch("removeTransientCard", state.choiceCardId);
    state.choiceCardId = null;
  }
};
