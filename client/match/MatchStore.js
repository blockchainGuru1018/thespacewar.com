const PutDownCardEvent = require('../../shared/PutDownCardEvent.js');
const PHASES = ['draw', 'action', 'discard', 'attack'];

module.exports = function (deps) {

    const userRepository = deps.userRepository;
    const opponentUser = deps.opponentUser;
    const matchId = deps.matchId;
    const matchControllerFactory = deps.matchControllerFactory;

    let matchController;

    return {
        namespaced: true,
        state: {
            turn: 1,
            currentPlayer: null,
            phase: 'draw',
            matchId,
            opponentUser,
            ownUser: userRepository.getOwnUser(),
            actionPoints: 15,
            playerCardsInZone: [],
            playerCardsOnHand: [],
            playerDiscardedCards: [],
            playerStation: {
                drawCards: [],
                actionCards: [],
                handSizeCards: []
            },
            opponentCardCount: 0,
            opponentDiscardedCards: [],
            opponentStation: {
                drawCards: [],
                actionCards: [],
                handSizeCards: []
            },
            events: []
        },
        getters: {
            playerCardModels
        },
        mutations: {
            setPlayerStationCards,
            setPlayerCardsOnHand,
            setOpponentStationCards,
            addOpponentStationCards
        },
        actions: {
            init,
            restoreState,
            beginGame,
            persistOngoingMatch,
            nextPhase,
            putDownCard,
            putDownOpponentCard,
            discardCard,
            opponentDiscardedCard,
            setOpponentCardCount,
            placeCardInZone,
            nextPlayer
        }
    };

    function playerCardModels(state) {
        return state.playerCardsOnHand.map(card => {
            // const highlighted = state.actionPoints >= card.cost; // TODO Should cards be highlighted? Perhaps no, since at least 1 card can always be discarded etc.
            return {
                ...card,
                highlighted: false
            };
        });
    }

    function setPlayerStationCards(state, stationCards) {
        state.playerStation.drawCards = stationCards
            .filter(s => s.place === 'draw')
            .map(s => s.card);
        state.playerStation.actionCards = stationCards
            .filter(s => s.place === 'action')
            .map(s => s.card);
        state.playerStation.handSizeCards = stationCards
            .filter(s => s.place === 'handSize')
            .map(s => s.card);
    }

    function setPlayerCardsOnHand(state, cards) {
        state.playerCardsOnHand = cards;
    }

    function setOpponentStationCards(state, stationCards) {
        state.opponentStation.drawCards = stationCards
            .filter(s => s.place === 'draw')
            .map(s => ({}));
        state.opponentStation.actionCards = stationCards
            .filter(s => s.place === 'action')
            .map(s => ({}));
        state.opponentStation.handSizeCards = stationCards
            .filter(s => s.place === 'handSize')
            .map(s => ({}));
    }

    function addOpponentStationCards(state, location) {
        if (location === 'draw') {
            state.opponentStation.drawCards.push({});
        }
        else if (location === 'action') {
            state.opponentStation.actionCards.push({});
        }
        else if (location === 'handSize') {
            state.opponentStation.handSizeCards.push({});
        }
    }

    async function init({ dispatch }) {
        matchController = matchControllerFactory.create({ dispatch, matchId });
        matchController.start();
    }

    function nextPlayer({ state }, { turn, currentPlayer }) {
        state.currentPlayer = currentPlayer;
        state.turn = turn;
        state.phase = 'draw';
    }

    function restoreState({ state, commit }, restoreState) {
        const {
            stationCards,
            cardsOnHand,
            cardsInZone,
            discardedCards,
            opponentCardCount,
            opponentDiscardedCards,
            opponentStationCards,
            events,
            phase,
            actionPoints,
            turn,
            currentPlayer
        } = restoreState;
        commit('setPlayerStationCards', stationCards);
        commit('setPlayerCardsOnHand', cardsOnHand);
        state.playerCardsInZone = cardsInZone;
        state.playerDiscardedCards = discardedCards;
        state.opponentCardCount = opponentCardCount;
        state.opponentDiscardedCards = opponentDiscardedCards;
        commit('setOpponentStationCards', opponentStationCards);

        state.events = events;
        state.turn = turn;
        state.currentPlayer = currentPlayer;
        state.phase = phase;
        state.actionPoints = actionPoints;
    }

    async function beginGame({ state, commit, dispatch }, beginningState) {
        const {
            stationCards,
            cardsOnHand,
            opponentCardCount,
            opponentStationCards,
            currentPlayer
        } = beginningState;
        commit('setPlayerStationCards', stationCards);
        commit('setPlayerCardsOnHand', cardsOnHand);
        state.opponentCardCount = opponentCardCount;
        commit('setOpponentStationCards', opponentStationCards);

        state.currentPlayer = currentPlayer;

        dispatch('persistOngoingMatch');

        state.actionPoints = state.playerStation.actionCards.length * 2;
        dispatch('nextPhase');
    }

    function nextPhase({ state }) {
        matchController.emit('nextPhase');
        state.phase = PHASES[PHASES.indexOf(state.phase) + 1];
    }

    function putDownCard({ state, dispatch }, { location, cardId }) {
        const cardIndexOnHand = state.playerCardsOnHand.findIndex(c => c.id === cardId);
        const card = state.playerCardsOnHand[cardIndexOnHand];
        state.playerCardsOnHand.splice(cardIndexOnHand, 1);
        state.actionPoints -= card.cost;

        matchController.emit('putDownCard', { location, cardId });

        if (location.startsWith('station')) {
            if (location === 'station-draw') {
                state.playerStation.drawCards.push(card);
            }
            else if (location === 'station-action') {
                state.playerStation.actionCards.push(card);
            }
            else if (location === 'station-handSize') {
                state.playerStation.handSizeCards.push(card);
            }
        }
        else if (location === 'zone') {
            dispatch('placeCardInZone', card);
        }

        state.events.push(PutDownCardEvent({ turn: state.turn, location, cardId }));
    }

    function placeCardInZone({ state }, card) {
        state.playerCardsInZone.push(card);
    }

    function discardCard({ state }, cardId) {
        const cardIndexOnHand = state.playerCardsOnHand.findIndex(c => c.id === cardId);
        const card = state.playerCardsOnHand[cardIndexOnHand];
        state.playerCardsOnHand.splice(cardIndexOnHand, 1);
        state.actionPoints += 2;
        state.playerDiscardedCards.push(card);
        matchController.emit('discardCard', cardId);
    }

    function setOpponentCardCount({ state }, opponentCardCount) {
        state.opponentCardCount = opponentCardCount;
    }

    function opponentDiscardedCard({ state }, { bonusCard, discardedCard, opponentCardCount }) {
        state.playerCardsOnHand.unshift(bonusCard);
        state.opponentCardCount = opponentCardCount;
        state.opponentDiscardedCards.push(discardedCard);
    }

    function putDownOpponentCard({ state, commit }, { location }) {
        state.opponentCardCount -= 1;
        if (location.startsWith('station')) {
            const stationLocation = location.split('-').pop();
            commit('addOpponentStationCards', stationLocation);
        }
    }

    function persistOngoingMatch({ state }) {
        const playerIds = [state.ownUser.id, state.opponentUser.id]
        const matchData = { id: matchId, playerIds };
        localStorage.setItem('ongoing-match', JSON.stringify(matchData));
    }
};