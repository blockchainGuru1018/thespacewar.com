const PutDownCardEvent = require('../../shared/PutDownCardEvent.js');

const falsyOp = () => false;

module.exports = function (deps) {

    const {
        matchController,
        getFrom,
        cardInfoRepository,
        rootDispatch
    } = deps;

    let onActiveActionFinish = null;

    return {
        namespaced: true,
        name: 'card',
        state: {
            choiceCardId: null,
            activeActionCardData: null,
            activeAction: null,
            selectedCardIdsForAction: [],
            transientPlayerCardsInHomeZone: [],
            hiddenCardIdsOnHand: [],
            hiddenStationCardIds: [],
            checkIfCanBeSelectedForAction: falsyOp
        },
        getters: {
            choiceCardData,
            activeActionCard,
            activeActionCardImageUrl,
            canSelectMoreCardsForAction
        },
        actions: {
            // Utils/Transient cards
            moveCardToZoneAsTransient,
            removeTransientCard,

            // Card choices
            showChoiceDialog,
            choiceDialogApplyChoice,
            choiceDialogCancel,

            // Card action
            showCardAction,
            selectCardForActiveAction,
            cancelCardAction,

            // Sacrifice
            startSacrifice,
            _completeSacrifice,

            // PutDownCard
            startPuttingDownCard, //Use this and not "putDownCard", this will in turn call putdowncard
            putDownCard, //TODO Need better naming scheme for when putting down a card and for actually sending event to matchController

            // Cancel any action, note: move to own store?
            cancelCurrentUserInteraction,

            _hideChoiceDialog,
        }
    };

    function choiceCardData(state, getters, rootState, rootGetters) {
        return rootGetters['match/findPlayerCardFromAllSources'](state.choiceCardId);
    }

    function activeActionCard(state, getters, rootState, rootGetters) {
        if (!state.activeActionCardData) return null;
        return rootGetters['match/createCard'](state.activeActionCardData);
    }

    function activeActionCardImageUrl(state) {
        if (!state.activeActionCardData) return '';

        if (state.activeAction.showCardImage) {
            return cardInfoRepository.getImageUrl(state.activeActionCardData.commonId);
        }
        else {
            return '';
        }
    }

    function canSelectMoreCardsForAction(state, getters, rootState, rootGetters) {
        if (!state.activeAction) return false;

        if (state.activeAction.name === 'sacrifice') {
            const opponentStationCards = rootGetters['match/allOpponentStationCards'];
            const selectedStationCardCount = state.selectedCardIdsForAction
                .filter(id => opponentStationCards.some(s => s.id === id))
                .length;

            const hasSelectedOneCardFromAZone = state.selectedCardIdsForAction.length === 1 && selectedStationCardCount === 0
            if (hasSelectedOneCardFromAZone) {
                return false;
            }

            const unflippedOpponentStationCardCount = opponentStationCards.filter(s => !s.flipped).length;
            const isLessThanLimitAndHasMoreCardsToPickFrom = selectedStationCardCount < 4
                && selectedStationCardCount < unflippedOpponentStationCardCount;

            return isLessThanLimitAndHasMoreCardsToPickFrom;
        }
        else {
            return false;
        }
    }

    function moveCardToZoneAsTransient({ state }, cardData) {
        state.transientPlayerCardsInHomeZone.push(cardData);
        state.hiddenCardIdsOnHand.push(cardData.id);
        state.hiddenStationCardIds.push(cardData.id);
    }

    function removeTransientCard({ state }, cardId) {
        state.hiddenCardIdsOnHand = state.hiddenCardIdsOnHand.filter(id => id !== cardId);
        state.hiddenStationCardIds = state.hiddenStationCardIds.filter(id => id !== cardId);
        state.transientPlayerCardsInHomeZone = state.transientPlayerCardsInHomeZone.filter(c => c.id !== cardId);
    }

    function startSacrifice({ state, getters, dispatch, rootState, rootGetters }, cardId) {
        const cardData = rootGetters['match/findPlayerCardFromAllSources'](cardId);
        dispatch('showCardAction', {
            cardData,
            action: {
                showCardImage: false,
                name: 'sacrifice'
            },
            checkIfCanBeSelectedForAction: (activeCard, { cardData, isStationCard, isOpponentCard }) => { //TODO Can this be a getter function based on the current active action name?
                if (!isOpponentCard) return false;
                if (!isStationCard && state.selectedCardIdsForAction.length > 0) return false;

                const card = rootGetters['match/createCard'](cardData, { isOpponent: isOpponentCard });

                if (isStationCard) {
                    if (activeCard.isInHomeZone()) return false;
                    if (cardData.flipped) return false;

                    const someCardStopsAttacks = rootState.match.opponentCardsInZone
                        .some(c => rootGetters['match/createCard'](c).stopsStationAttack());
                    if (someCardStopsAttacks) return false;
                    return activeCard.canTargetCardForSacrifice(card);
                }
                else {
                    return activeCard.canTargetCardForSacrifice(card);
                }
            },
            onFinish: targetCardIds => dispatch('_completeSacrifice', { cardId, targetCardIds })
        });
    }

    function _completeSacrifice({ rootGetters }, { cardId, targetCardIds }) {
        const opponentStationCards = rootGetters['match/allOpponentStationCards'];
        const firstCardIsStationCard = opponentStationCards.some(s => s.id === targetCardIds[0]);
        if (targetCardIds.length === 1 && !firstCardIsStationCard) {
            matchController.emit('sacrifice', { cardId, targetCardId: targetCardIds[0] });
        }
        else {
            matchController.emit('sacrifice', { cardId, targetCardIds });
        }
    }

    function startPuttingDownCard({ dispatch, rootGetters }, { location, cardId }) {
        const cardData = rootGetters['match/findPlayerCardFromAllSources'](cardId);
        const card = rootGetters['match/createCard'](cardData)
        if (location === 'zone' && card.choicesWhenPutDownInHomeZone) {
            dispatch('showChoiceDialog', cardData);
        }
        else if (location === 'zone' && card.actionWhenPutDownInHomeZone) {
            dispatch('showCardAction', {
                cardData,
                action: card.actionWhenPutDownInHomeZone,
                useTransientCard: true,
                checkIfCanBeSelectedForAction: (actionCard, { cardData, isStationCard, isOpponentCard }) => {
                    return isOpponentCard;
                },
                onFinish: targetCardIds => dispatch('putDownCard', { location, cardId, choice: targetCardIds[0] })
            });
        }
        else {
            dispatch('putDownCard', { location, cardId });
        }
    }

    function showChoiceDialog({ state, dispatch }, cardData) {
        dispatch('moveCardToZoneAsTransient', cardData);
        state.choiceCardId = cardData.id;
    }

    function choiceDialogCancel({ state, dispatch }) {
        dispatch('_hideChoiceDialog');
    }

    async function choiceDialogApplyChoice({ state, dispatch }, choice) {
        rootDispatch.loadingIndicator.show();
        const choiceCardId = state.choiceCardId;
        dispatch('_hideChoiceDialog');
        await dispatch('putDownCard', { location: 'zone', choice, cardId: choiceCardId });
        dispatch('removeTransientCard', choiceCardId);
        rootDispatch.loadingIndicator.hide();
    }

    function showCardAction({ state, getters, dispatch },
        { cardData, action, checkIfCanBeSelectedForAction, onFinish }) {
        onActiveActionFinish = onFinish;
        if (action.showTransientCardInHomeZone) {
            dispatch('moveCardToZoneAsTransient', cardData);
        }
        state.activeActionCardData = cardData;
        state.activeAction = action;

        state.checkIfCanBeSelectedForAction = options => {
            return checkIfCanBeSelectedForAction(getters.activeActionCard, options);
        }
    }

    async function selectCardForActiveAction({ state, getters, dispatch }, targetCardId) {
        state.selectedCardIdsForAction.push(targetCardId);
        if (getters.canSelectMoreCardsForAction) return;

        rootDispatch.loadingIndicator.show();
        await onActiveActionFinish(state.selectedCardIdsForAction);
        rootDispatch.loadingIndicator.hide();

        dispatch('cancelCardAction');
    }

    function cancelCardAction({ state, dispatch }) {
        onActiveActionFinish = null;
        dispatch('removeTransientCard', state.activeActionCardData.id);
        state.activeActionCardData = null;
        state.activeAction = null;
        state.checkIfCanBeSelectedForAction = falsyOp;
        state.selectedCardIdsForAction = [];
    }

    async function putDownCard({ state, rootState, dispatch, commit }, { cardId, choice = null, location }) { //TODO Should not directly manipulate state of MatchStore
        const matchState = rootState.match;

        const cardIndexOnHand = matchState.playerCardsOnHand.findIndex(c => c.id === cardId);
        const cardOnHand = matchState.playerCardsOnHand[cardIndexOnHand];
        const allPlayerStationCards = getFrom('allPlayerStationCards', 'match');
        const stationCard = allPlayerStationCards.find(s => s.id === cardId);
        const cardData = cardOnHand || stationCard.card;

        if (cardOnHand) {
            matchState.playerCardsOnHand.splice(cardIndexOnHand, 1);
        }
        else if (stationCard) {
            commit('match/setPlayerStationCards', allPlayerStationCards.filter(s => s.id !== cardId), { root: true });
        }

        matchState.events.push(PutDownCardEvent({
            turn: matchState.turn,
            location,
            cardId,
            cardCommonId: cardData.commonId
        }));

        if (choice) {
            matchController.emit('putDownCard', { location, cardId, choice });
        }
        else {
            matchController.emit('putDownCard', { location, cardId });
        }

        if (location.startsWith('station')) {
            if (location === 'station-draw') {
                matchState.playerStation.drawCards.push(cardData);
            }
            else if (location === 'station-action') {
                matchState.playerStation.actionCards.push(cardData);
            }
            else if (location === 'station-handSize') {
                matchState.playerStation.handSizeCards.push(cardData);
            }
        }
        else if (location === 'zone') {
            if (cardData.type === 'event') {
                matchState.playerDiscardedCards.push(cardData);
            }
            else {
                dispatch('match/placeCardInZone', cardData, { root: true });
            }
        }
    }

    function cancelCurrentUserInteraction({ state, rootState, dispatch }) {
        if (rootState.match.attackerCardId) {
            dispatch('match/cancelAttack', null, { root: true });
        }
        else if (rootState.match.repairerCardId) {
            dispatch('match/cancelRepair', null, { root: true });
        }
        else if (state.activeAction) {
            dispatch('cancelCardAction');
        }
    }

    function _hideChoiceDialog({ state, dispatch }) {
        dispatch('removeTransientCard', state.choiceCardId);
        state.choiceCardId = null;
    }
}