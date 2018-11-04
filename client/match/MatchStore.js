const PutDownCardEvent = require('../../shared/PutDownCardEvent.js');
const ActionPointsCalculator = require('../../shared/match/ActionPointsCalculator.js');
const PHASES = ['draw', 'action', 'discard', 'attack'];

//TODO should recalculate action points when discard a card
//TODO when moving card should show arrow to where the card is moving

module.exports = function (deps) {

    const userRepository = deps.userRepository;
    const opponentUser = deps.opponentUser;
    const matchId = deps.matchId;
    const matchControllerFactory = deps.matchControllerFactory;
    const cardInfoRepository = deps.cardInfoRepository;

    const actionPointsCalculator = ActionPointsCalculator({ cardInfoRepository });
    let matchController;

    return {
        namespaced: true,
        state: {
            turn: 1,
            currentPlayer: null,
            phase: '',
            matchId,
            opponentUser,
            ownUser: userRepository.getOwnUser(),
            actionPoints: 0,
            playerCardsInZone: [],
            playerCardsOnHand: [],
            playerDiscardedCards: [],
            playerStation: {
                drawCards: [],
                actionCards: [],
                handSizeCards: []
            },
            playerCardsInOpponentZone: [],
            opponentCardCount: 0,
            opponentDiscardedCards: [],
            opponentStation: {
                drawCards: [],
                actionCards: [],
                handSizeCards: []
            },
            opponentCardsInPlayerZone: [],
            opponentCardsInZone: [],
            events: []
        },
        getters: {
            playerCardModels,
            nextPhaseButtonText,
            maxHandSize,
            hasPutDownNonFreeCardThisTurn,
            actionPoints2
        },
        mutations: {
            setPlayerStationCards,
            setPlayerCardsOnHand,
            setOpponentStationCards,
            addOpponentStationCards
        },
        actions: {
            // local & remote
            init,
            putDownCard,
            discardCard,
            nextPhase,
            setActionPoints,
            moveCard,

            // local
            restoreState,
            beginGame,
            placeCardInZone,
            opponentDiscardedCard,
            putDownOpponentCard,
            opponentMovedCard,
            setOpponentCardCount,
            nextPlayer,
            persistOngoingMatch,
            drawCards
        }
    };

    function playerCardModels(state) {
        return state.playerCardsOnHand.map(card => {
            return {
                ...card,
                highlighted: false // TODO Keep if we want to re-introduce card highlighting
            };
        });
    }

    function nextPhaseButtonText(state) {
        if (state.phase === PHASES[PHASES.length - 1]) {
            return '';
        }
        let nextPhase = PHASES[PHASES.indexOf(state.phase) + 1];
        return capitalize(nextPhase);
    }

    function maxHandSize(state) {
        return state.playerStation.handSizeCards.length * 3;
    }

    function hasPutDownNonFreeCardThisTurn(state) {
        return state.events.some(e =>
            e.turn === state.turn
            && e.type === 'putDownCard'
            && e.location === 'zone'
            && cardInfoRepository.getCost(e.cardId) > 0);
    }

    function actionPoints2(state) {
        return actionPointsCalculator.calculate({
            phase: state.phase,
            turn: state.turn,
            events: state.events,
            actionStationCardsCount: state.playerStation.actionCards.length
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
        if (currentPlayer === state.ownUser.id) {
            state.phase = 'draw';
        }
        else {
            state.phase = 'wait';
        }
    }

    function restoreState({ state, commit }, restoreState) {
        const {
            stationCards,
            cardsOnHand,
            cardsInZone,
            cardsInOpponentZone,
            discardedCards,
            opponentCardCount,
            opponentDiscardedCards,
            opponentStationCards,
            opponentCardsInZone,
            opponentCardsInPlayerZone,
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
        state.playerCardsInOpponentZone = cardsInOpponentZone;
        state.opponentCardCount = opponentCardCount;
        state.opponentDiscardedCards = opponentDiscardedCards;
        state.opponentCardsInZone = opponentCardsInZone;
        state.opponentCardsInPlayerZone = opponentCardsInPlayerZone;
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
            phase,
            currentPlayer
        } = beginningState;
        commit('setPlayerStationCards', stationCards);
        commit('setPlayerCardsOnHand', cardsOnHand);
        commit('setOpponentStationCards', opponentStationCards);
        state.opponentCardCount = opponentCardCount;
        state.phase = phase;
        state.currentPlayer = currentPlayer;

        dispatch('persistOngoingMatch');
    }

    function nextPhase({ state }) {
        const nextPhaseIndex = PHASES.indexOf(state.phase) + 1;
        if (nextPhaseIndex >= PHASES.length) {
            state.currentPlayer = null;
            state.phase = 'draw';
        }
        else {
            state.phase = PHASES[nextPhaseIndex];
        }

        matchController.emit('nextPhase');
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

    function setActionPoints({ state }, actionPoints) {
        state.actionPoints = actionPoints;
    }

    function moveCard({ state }, { id }) {
        const cardIndex = state.playerCardsInZone.findIndex(c => c.id === id);
        const [card] = state.playerCardsInZone.splice(cardIndex, 1);
        state.playerCardsInOpponentZone.push(card);
        matchController.emit('moveCard', id);
    }

    function setOpponentCardCount({ state }, opponentCardCount) {
        state.opponentCardCount = opponentCardCount;
    }

    function opponentDiscardedCard({ state }, { bonusCard, discardedCard, opponentCardCount }) {
        if (bonusCard) {
            state.playerCardsOnHand.unshift(bonusCard);
        }

        state.opponentCardCount = opponentCardCount;
        state.opponentDiscardedCards.push(discardedCard);
    }

    function putDownOpponentCard({ state, commit }, { location, card = null }) {
        state.opponentCardCount -= 1;
        if (location.startsWith('station')) {
            const stationLocation = location.split('-').pop();
            commit('addOpponentStationCards', stationLocation);
        }
        else if (location === 'zone') {
            state.opponentCardsInZone.push(card);
        }
    }

    function opponentMovedCard({ state }, cardId) {
        let cardIndex = state.opponentCardsInZone.findIndex(c => c.id === cardId);
        let [card] = state.opponentCardsInZone.splice(cardIndex, 1);
        state.opponentCardsInPlayerZone.push(card);
    }

    function persistOngoingMatch({ state }) {
        const playerIds = [state.ownUser.id, state.opponentUser.id]
        const matchData = { id: matchId, playerIds };
        localStorage.setItem('ongoing-match', JSON.stringify(matchData));
    }

    function drawCards({ state }, cards) {
        state.playerCardsOnHand.push(...cards);
    }
};

function capitalize(word) {
    return word.substr(0, 1).toUpperCase() + word.substr(1);
}