const PutDownCardEvent = require('../../shared/PutDownCardEvent.js');

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
            transientPlayerCardsInHomeZone: [],
            hiddenCardIdsOnHand: [],
            hiddenStationCardIds: []
        },
        getters: {
            choiceCardData,
            activeActionCard,
            activeActionCardImageUrl
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

            // Sacrifice
            startSacrifice,
            _completeSacrifice,

            // PutDownCard
            startPuttingDownCard, //Use this and not "putDownCard", this will in turn call putdowncard
            putDownCard, //TODO Need better naming scheme for when putting down a card and for actually sending event to matchController

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

    function startSacrifice({ dispatch, rootGetters }, cardId) {
        const cardData = rootGetters['match/findPlayerCardFromAllSources'](cardId);
        dispatch('showCardAction', {
            cardData,
            action: {
                showCardImage: false,
                showGuideText: false,
                name: 'sacrifice'
            },
            onFinish: targetCardId => dispatch('_completeSacrifice', { cardId, targetCardId })
        });
    }

    function _completeSacrifice({}, { cardId, targetCardId }) {
        matchController.emit('sacrifice', { cardId, targetCardId });
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
                onFinish: targetCardId => dispatch('putDownCard', { location, cardId, choice: targetCardId }),
                useTransientCard: true
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
        await dispatch('putDownCard', {
            location: 'zone',
            choice,
            cardId: state.choiceCardId
        });
        await dispatch('removeTransientCard', state.choiceCardId);
        dispatch('_hideChoiceDialog');
        rootDispatch.loadingIndicator.hide();
    }

    function showCardAction({ state, dispatch }, { cardData, action, onFinish }) {
        onActiveActionFinish = onFinish;
        if (action.showTransientCardInHomeZone) {
            dispatch('moveCardToZoneAsTransient', cardData);
        }
        state.activeActionCardData = cardData;
        state.activeAction = action;
    }

    async function selectCardForActiveAction({ state, dispatch }, targetCardId) { //TODO Will probably need to support selecting multiple cards for an action
        rootDispatch.loadingIndicator.show();
        await onActiveActionFinish(targetCardId);
        rootDispatch.loadingIndicator.hide();

        onActiveActionFinish = null;
        dispatch('removeTransientCard', state.activeActionCardData.id);
        state.activeActionCardData = null;
        state.activeAction = null;
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

    function _hideChoiceDialog({ state, dispatch }) {
        dispatch('removeTransientCard', state.choiceCardId);
        state.choiceCardId = null;
    }
}