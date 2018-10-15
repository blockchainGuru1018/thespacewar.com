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
            phase: 'draw',
            matchId,
            opponentUser,
            ownUser: userRepository.getOwnUser(),
            actionPoints: 15,
            playerStation: {
                drawCards: [],
                actionCards: [],
                handSizeCards: []
            },
            playerCardsOnHand: [],
            opponentCardCount: 0,
            opponentStation: {
                drawCards: [],
                actionCards: [],
                handSizeCards: []
            }
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
            putDownOpponentCard
        }
    };

    function playerCardModels(state) {
        return state.playerCardsOnHand.map(card => {
            const highlighted = state.actionPoints >= card.cost;
            return {
                ...card,
                highlighted
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
            state.opponentStation.actionCards.push({});
        }
    }

    async function init({ dispatch }) {
        matchController = matchControllerFactory.create({ dispatch, matchId });
        matchController.start();
    }

    function restoreState({ state, commit }, restoreState) {
        const {
            stationCards,
            cardsOnHand,
            opponentCardCount,
            opponentStationCards,
            phase,
            actionPoints
        } = restoreState;
        commit('setPlayerStationCards', stationCards);
        commit('setPlayerCardsOnHand', cardsOnHand);
        state.opponentCardCount = opponentCardCount;
        commit('setOpponentStationCards', opponentStationCards);

        state.phase = phase;
        state.actionPoints = actionPoints;
    }

    async function beginGame({ state, commit, dispatch }, beginningState) {
        const {
            stationCards,
            cardsOnHand,
            opponentCardCount,
            opponentStationCards
        } = beginningState;
        commit('setPlayerStationCards', stationCards);
        commit('setPlayerCardsOnHand', cardsOnHand);
        state.opponentCardCount = opponentCardCount;
        commit('setOpponentStationCards', opponentStationCards);

        dispatch('persistOngoingMatch');

        state.actionPoints = state.playerStation.actionCards.length * 2;
        dispatch('nextPhase');
    }

    function nextPhase({ state }) {
        matchController.emit('nextPhase');
        state.phase = PHASES[PHASES.indexOf(state.phase) + 1];
    }

    function putDownCard({ state }, { location, cardId }) {
        const cardIndexOnHand = state.playerCardsOnHand.findIndex(c => c.id === cardId);
        const card = state.playerCardsOnHand[cardIndexOnHand];
        state.playerCardsOnHand.splice(cardIndexOnHand, 1);
        state.actionPoints -= card.cost;

        if (location === 'station-draw') {
            state.playerStation.drawCards.push(card);
        }
        else if (location === 'station-action') {
            state.playerStation.actionCards.push(card);
        }
        else if (location === 'station-handSize') {
            state.playerStation.handSizeCards.push(card);
        }
        matchController.emit('putDownCard', { location, cardId });
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