const PutDownCardEvent = require('../../shared/PutDownCardEvent.js');

module.exports = function (deps) {

    const {
        matchController,
        getFrom
    } = deps;

    return {
        namespaced: true,
        name: 'putDownCard',
        state: {
            choiceCardId: null
        },
        getters: {
            choiceCardData
        },
        actions: {
            showChoiceDialog,
            hideChoiceDialog,
            putDownCard
        }
    };

    function choiceCardData(state, getters, rootState, rootGetters) {
        return rootGetters['match/findPlayerCardFromAllSources'](state.choiceCardId);
    }

    function showChoiceDialog({ state }, cardId) {
        state.choiceCardId = cardId;
    }

    function hideChoiceDialog({ state }) {
        state.choiceCardId = null;
    }

    function putDownCard({ rootState, commit, dispatch }, { cardId, choice = null, location }) { //TODO Should not directly manipulate state of MatchStore
        const matchState = rootState.match;

        const cardIndexOnHand = matchState.playerCardsOnHand.findIndex(c => c.id === cardId);
        const cardOnHand = matchState.playerCardsOnHand[cardIndexOnHand];
        const allPlayerStationCards = getFrom('allPlayerStationCards', 'match');
        const stationCard = allPlayerStationCards.find(s => s.id === cardId);
        const card = cardOnHand || stationCard.card;

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
            cardCommonId: card.commonId
        }));

        if (choice) {
            matchController.emit('putDownCard', { location, cardId, choice });
        }
        else {
            matchController.emit('putDownCard', { location, cardId });
        }

        if (location.startsWith('station')) {
            if (location === 'station-draw') {
                matchState.playerStation.drawCards.push(card);
            }
            else if (location === 'station-action') {
                matchState.playerStation.actionCards.push(card);
            }
            else if (location === 'station-handSize') {
                matchState.playerStation.handSizeCards.push(card);
            }
        }
        else if (location === 'zone') {
            if (card.type === 'event') {
                matchState.playerDiscardedCards.push(card);
            }
            else {
                dispatch('match/placeCardInZone', card, { root: true });
            }
        }
    }
}