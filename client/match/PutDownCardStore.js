const PutDownCardEvent = require('../../shared/PutDownCardEvent.js');

module.exports = function (deps) {

    const {
        matchController,
        getFrom
    } = deps;

    //TODO Needs a better name more in-line with what resource is hold. Is about the "card being put down".
    return {
        namespaced: true,
        name: 'putDownCard',
        state: {
            choiceCardId: null,
            activeActionCardData: null,
            transientPlayerCardsInHomeZone: [],
            hiddenCardIdsOnHand: []
        },
        getters: {
            choiceCardData,
            activeAction
        },
        actions: {
            showChoiceDialog,
            hideChoiceDialog,
            showCardAction,
            selectCardForActiveAction,
            putDownCard
        }
    };

    function choiceCardData(state, getters, rootState, rootGetters) {
        return rootGetters['match/findPlayerCardFromAllSources'](state.choiceCardId);
    }

    function activeAction(state) {
        if (!state.activeActionCardData) return null;

        const card = getFrom('createCard', 'match')(state.activeActionCardData);
        return card.actionWhenPutDownInHomeZone
    }

    function showChoiceDialog({ state }, cardData) {
        state.choiceCardId = cardData.id;
        state.transientPlayerCardsInHomeZone.push(cardData);
        state.hiddenCardIdsOnHand.push(cardData.id);
    }

    function hideChoiceDialog({ state }) {
        const choiceCardId = state.choiceCardId
        state.choiceCardId = null;

        state.transientPlayerCardsInHomeZone = state.transientPlayerCardsInHomeZone
            .filter(card => card.id !== choiceCardId);
        state.hiddenCardIdsOnHand = state.hiddenCardIdsOnHand.filter(c => c.id !== choiceCardId);
    }

    function showCardAction({ state }, cardData) {
        state.transientPlayerCardsInHomeZone.push(cardData);
        state.hiddenCardIdsOnHand.push(cardData.id);
        state.activeActionCardData = cardData;
    }

    function selectCardForActiveAction({ state, dispatch }, targetCardId) {
        const options = {
            location: 'zone',
            cardId: state.activeActionCardData.id,
            choice: targetCardId
        };
        state.activeActionCardData = null;
        dispatch('putDownCard', options);
    }

    function putDownCard({ state, rootState, commit, dispatch }, { cardId, choice = null, location }) { //TODO Should not directly manipulate state of MatchStore
        state.transientPlayerCardsInHomeZone = state.transientPlayerCardsInHomeZone.filter(c => c.id !== cardId);
        state.hiddenCardIdsOnHand = state.hiddenCardIdsOnHand.filter(c => c.id !== cardId);

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
}