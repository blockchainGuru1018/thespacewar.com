const PutDownCardEvent = require('../../shared/PutDownCardEvent.js');
const DiscardCardEvent = require('../../shared/event/DiscardCardEvent.js');
const AttackEvent = require('../../shared/event/AttackEvent.js');
const MoveCardEvent = require('../../shared/event/MoveCardEvent.js');
const ActionPointsCalculator = require('../../shared/match/ActionPointsCalculator.js');
const CardDataAssembler = require('../../shared/CardDataAssembler.js');
const CardFactory = require('../card/ClientCardFactory.js');
const {
    COMMON_PHASE_ORDER,
    PHASES
} = require('./phases.js');

const storeItemNameByServerItemName = {
    cardsInZone: 'playerCardsInZone',
    discardedCards: 'playerDiscardedCards',
    cardsOnHand: 'playerCardsOnHand'
};

//TODO When move handsize station card to zone, a station card from draw station cards is removed.
// But now always. Perhaps it filters on commonId? Or two cards had the same id somehow..?
//TODO Sometimes when discarding a card in the discard phase an error is thrown in the console. Does not appear to affect gameplay.
//TODO Fix: Naively creates a Card with ownUser.id. But the createCard method is also used to created opponent card in ZoneCard.vue.

module.exports = function (deps) {

    const route = deps.route;
    const userRepository = deps.userRepository;
    const opponentUser = deps.opponentUser;
    const matchId = deps.matchId;
    const matchControllerFactory = deps.matchControllerFactory;
    const cardInfoRepository = deps.cardInfoRepository;
    const actionPointsCalculator = deps.actionPointsCalculator || ActionPointsCalculator({ cardInfoRepository });
    const cardFactory = deps.cardFactory || new CardFactory();

    let matchController;

    return {
        namespaced: true,
        state: {
            turn: 1,
            currentPlayer: null,
            phase: '',
            events: [],
            matchId,
            opponentUser,
            ownUser: userRepository.getOwnUser(),
            actionPoints: 0, // TODO Remove, all action points should be calculated through events
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
            attackerCardId: null,
            selectedDefendingStationCards: []
        },
        getters: {
            playerCardModels,
            nextPhase,
            maxHandSize,
            hasPutDownNonFreeCardThisTurn,
            actionPoints2,
            attackerCard,
            attackerCanAttackStationCards,
            allPlayerCardsInOwnAndOpponentZone,
            allPlayerStationCards,
            allOpponentStationCards,
            createCard
        },
        mutations: {
            setPlayerStationCards,
            setPlayerCardsOnHand,
            setOpponentStationCards,
            addOpponentStationCards
        },
        actions: {
            // remote
            stateChanged,

            // local & remote
            init,
            putDownCard,
            discardCard,
            goToNextPhase,
            setActionPoints,
            moveCard,
            retreat,
            selectStationCardAsDefender,
            moveFlippedStationCardToZone,
            discardDurationCard,

            // local
            restoreState,
            beginGame,
            placeCardInZone,
            opponentDiscardedCard,
            opponentDiscardedDurationCard,
            putDownOpponentCard,
            putDownOpponentStationCard,
            opponentMovedCard,
            setOpponentCardCount,
            nextPlayer,
            persistOngoingMatch,
            drawCards,
            selectAsAttacker,
            selectAsDefender,
            opponentAttackedCard,
            addDiscardEvent,
            opponentRetreated,
            registerAttack,
            removePlayerCard,
            cancelAttack,
            endAttack
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

    function nextPhase(state) {
        const nextPhaseInOrder = COMMON_PHASE_ORDER[COMMON_PHASE_ORDER.indexOf(state.phase) + 1]
        return nextPhaseInOrder || 'wait';
    }

    function maxHandSize(state) {
        return state.playerStation.handSizeCards.length * 3;
    }

    function hasPutDownNonFreeCardThisTurn(state) {
        return state.events.some(e =>
            e.turn === state.turn
            && e.type === 'putDownCard'
            && e.location === 'zone'
            && cardInfoRepository.getCost(e.cardCommonId) > 0);
    }

    function actionPoints2(state) {
        return actionPointsCalculator.calculate({
            phase: state.phase,
            turn: state.turn,
            events: state.events,
            actionStationCardsCount: state.playerStation.actionCards.length
        });
    }

    function createCard(state) {
        return cardData => {
            return cardFactory.createFromVuexStore(cardData, state);
        };
    }

    function attackerCard(state, getters) {
        if (!state.attackerCardId) return null;

        const attackerCard = getters.allPlayerCardsInOwnAndOpponentZone.find(c => c.id === state.attackerCardId);
        return getters.createCard(attackerCard);
    }

    function attackerCanAttackStationCards(state, getters) {
        return getters.attackerCard.canAttackStationCards();
    }

    function allPlayerCardsInOwnAndOpponentZone(state) {
        return [
            ...state.playerCardsInZone,
            ...state.playerCardsInOpponentZone
        ];
    }

    function allPlayerStationCards(state) {
        return [
            ...state.playerStation.drawCards,
            ...state.playerStation.actionCards,
            ...state.playerStation.handSizeCards
        ];
    }

    function allOpponentStationCards(state) {
        return [
            ...state.opponentStation.drawCards,
            ...state.opponentStation.actionCards,
            ...state.opponentStation.handSizeCards
        ];
    }

    function setPlayerStationCards(state, stationCards) {
        state.playerStation.drawCards = stationCards
            .filter(s => s.place === 'draw')
            .sort(stationCardsByIsFlippedComparer);
        state.playerStation.actionCards = stationCards
            .filter(s => s.place === 'action')
            .sort(stationCardsByIsFlippedComparer);
        state.playerStation.handSizeCards = stationCards
            .filter(s => s.place === 'handSize')
            .sort(stationCardsByIsFlippedComparer);
    }

    function setPlayerCardsOnHand(state, cards) {
        state.playerCardsOnHand = cards;
    }

    function setOpponentStationCards(state, stationCards) {
        state.opponentStation.drawCards = stationCards
            .filter(s => s.place === 'draw')
            .sort(stationCardsByIsFlippedComparer);
        state.opponentStation.actionCards = stationCards
            .filter(s => s.place === 'action')
            .sort(stationCardsByIsFlippedComparer);
        state.opponentStation.handSizeCards = stationCards
            .filter(s => s.place === 'handSize')
            .sort(stationCardsByIsFlippedComparer);
    }

    function addOpponentStationCards(state, stationCard) {
        const location = stationCard.place;
        if (location === 'draw') {
            state.opponentStation.drawCards.push(stationCard);
        }
        else if (location === 'action') {
            state.opponentStation.actionCards.push(stationCard);
        }
        else if (location === 'handSize') {
            state.opponentStation.handSizeCards.push(stationCard);
        }
    }

    function stateChanged({ state, commit }, data) {
        for (let key of Object.keys(data)) {
            if (key === 'stationCards') {
                commit('setPlayerStationCards', data[key]);
            }
            else if (key === 'opponentStationCards') {
                commit('setOpponentStationCards', data[key]);
            }
            else {
                const localKey = storeItemNameByServerItemName[key] || key;
                state[localKey] = data[key];
            }
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
            const hasDurationCardInPlay = state.playerCardsInZone.some(c => c.type === 'duration');
            state.phase = hasDurationCardInPlay ? PHASES.preparation : PHASES.draw;
        }
        else {
            state.phase = PHASES.wait;
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
            actionPoints, // TODO Remove, all action points should be calculated through events
            turn,
            currentPlayer,
            opponentRetreated,
            playerRetreated
        } = restoreState;

        if (opponentRetreated || playerRetreated) {
            deleteMatchLocalDataAndReturnToLobby();
            return;
        }

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
        state.actionPoints = actionPoints; // TODO Remove, all action points should be calculated through events
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

    function goToNextPhase({ state, getters }) {
        const nextPhase = getters.nextPhase;
        if (nextPhase === PHASES.wait) {
            state.currentPlayer = null;
        }
        state.phase = nextPhase;

        matchController.emit('nextPhase');
    }

    function putDownCard({ state, getters, commit, dispatch }, { location, cardId }) {
        const cardIndexOnHand = state.playerCardsOnHand.findIndex(c => c.id === cardId);
        const cardOnHand = state.playerCardsOnHand[cardIndexOnHand];
        const stationCard = getters.allPlayerStationCards.find(s => s.id === cardId);
        const card = cardOnHand || stationCard.card;

        state.actionPoints -= card.cost; // TODO Remove, all action points should be calculated through events
        if (cardOnHand) {
            state.playerCardsOnHand.splice(cardIndexOnHand, 1);
        }
        else if (stationCard) {
            commit('setPlayerStationCards', getters.allPlayerStationCards.filter(s => s.id !== cardId));
        }

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
            if (card.type === 'event') {
                state.playerDiscardedCards.push(card);
            }
            else {
                dispatch('placeCardInZone', card);
            }
        }

        state.events.push(PutDownCardEvent({ turn: state.turn, location, cardId, cardCommonId: card.commonId }));
        matchController.emit('putDownCard', { location, cardId });
    }

    function placeCardInZone({ state }, card) {
        state.playerCardsInZone.push(card);
    }

    function discardCard({ state, dispatch }, cardId) {
        const cardIndexOnHand = state.playerCardsOnHand.findIndex(c => c.id === cardId);
        const discardedCard = state.playerCardsOnHand[cardIndexOnHand];
        state.playerCardsOnHand.splice(cardIndexOnHand, 1);
        state.actionPoints += 2; // TODO Remove, all action points should be calculated through events
        state.playerDiscardedCards.push(discardedCard);

        dispatch('addDiscardEvent', discardedCard);
        matchController.emit('discardCard', cardId);
    }

    function setActionPoints({ state }, actionPoints) { // TODO Should be removed, all action points should be calculated through events
        state.actionPoints = actionPoints;
    }

    function moveCard({ state }, { id }) {
        const cardIndex = state.playerCardsInZone.findIndex(c => c.id === id);
        const [card] = state.playerCardsInZone.splice(cardIndex, 1);
        state.playerCardsInOpponentZone.push(card);
        state.events.push(MoveCardEvent({ turn: state.turn, cardId: id, cardCommonId: card.commonId }));

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

    function opponentDiscardedDurationCard({ state }, { card }) {
        state.opponentDiscardedCards.push(card);
        const cardIndexInZone = state.opponentCardsInZone.findIndex(c => c.id === card.id);
        state.opponentCardsInZone.splice(cardIndexInZone, 1);
    }

    function putDownOpponentCard({ state, getters, commit }, { location, card }) {
        const stationCard = getters.allOpponentStationCards.find(s => s.id === card.id);
        if (!!stationCard) {
            commit('setOpponentStationCards', getters.allOpponentStationCards.filter(s => s.id !== card.id));
        }
        else {
            state.opponentCardCount -= 1;
        }

        if (location === 'zone') {
            state.opponentCardsInZone.push(card);
        }
    }

    function putDownOpponentStationCard({ state, commit }, stationCard) {
        state.opponentCardCount -= 1;
        commit('addOpponentStationCards', stationCard);
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

    function selectAsAttacker({ state }, card) {
        state.attackerCardId = card.id;
    }

    function selectAsDefender({ state, dispatch }, card) {
        const attackerCardId = state.attackerCardId;
        const defenderCardId = card.id
        matchController.emit('attack', { attackerCardId, defenderCardId });

        const defenderCardInOpponentZone = state.opponentCardsInZone.find(c => c.id === defenderCardId);
        const defenderCardInPlayerZone = state.opponentCardsInPlayerZone.find(c => c.id === defenderCardId)

        const attackerCardInPlayerZone = state.playerCardsInZone.find(c => c.id === attackerCardId);
        const attackerCardInOpponentZone = state.playerCardsInOpponentZone.find(c => c.id === attackerCardId);

        const defenderCardZone = !!defenderCardInOpponentZone ? state.opponentCardsInZone : state.opponentCardsInPlayerZone;
        const defenderCard = defenderCardInOpponentZone || defenderCardInPlayerZone;
        const attackerCard = attackerCardInOpponentZone || attackerCardInPlayerZone;
        const defenderCurrentDamage = defenderCard.damage || 0;
        const defenderTotalDefense = defenderCard.defense - defenderCurrentDamage;

        if (attackerCard.attack >= defenderTotalDefense) {
            const defenderCardIndex = defenderCardZone.findIndex(c => c.id === defenderCardId);
            defenderCardZone.splice(defenderCardIndex, 1);
        }
        else {
            defenderCard.damage = defenderCurrentDamage + attackerCard.attack;
        }

        dispatch('registerAttack', state.attackerCardId);
    }

    function opponentAttackedCard({ state }, { attackerCardId, defenderCardId, newDamage, defenderCardWasDestroyed }) {
        let defenderCardInPlayerZone = state.playerCardsInZone.find(c => c.id === defenderCardId);
        let defenderCardInOpponentZone = state.playerCardsInOpponentZone.find(c => c.id === defenderCardId);
        let defenderCard = defenderCardInPlayerZone || defenderCardInOpponentZone;
        let defenderCardZone = defenderCardInPlayerZone ? state.playerCardsInZone : state.playerCardsInOpponentZone;
        if (defenderCardWasDestroyed) {
            let defenderCardIndex = defenderCardZone.findIndex(c => c.id === defenderCardId);
            defenderCardZone.splice(defenderCardIndex, 1);
        }
        else {
            defenderCard.damage = newDamage;
        }
    }

    function cancelAttack({ dispatch }) {
        dispatch('endAttack');
    }

    function endAttack({ state }) {
        state.attackerCardId = null;
        state.selectedDefendingStationCards = [];
    }

    function addDiscardEvent({ state }, card) {
        state.events.push(DiscardCardEvent({
            turn: state.turn,
            phase: state.phase,
            cardId: card.id,
            cardCommonId: card.commonId
        }));
    }

    function retreat() {
        matchController.emit('retreat');
        deleteMatchLocalDataAndReturnToLobby();
    }

    function selectStationCardAsDefender({ state, getters, dispatch }, { id }) {
        const attackerCard = getters.attackerCard;
        state.selectedDefendingStationCards.push(id);

        if (state.selectedDefendingStationCards.length >= attackerCard.attack) {
            matchController.emit('attackStationCard', {
                attackerCardId: state.attackerCardId,
                targetStationCardIds: state.selectedDefendingStationCards
            });

            dispatch('registerAttack', state.attackerCardId);
        }
    }

    function registerAttack({ state, getters, dispatch }, attackerCardId) {
        const cardData = getters.allPlayerCardsInOwnAndOpponentZone.find(c => c.id === attackerCardId);
        if (cardData.type === 'missile') {
            dispatch('removePlayerCard', attackerCardId);
        }
        state.events.push(AttackEvent({
            turn: state.turn,
            attackerCardId,
            cardCommonId: cardData.commonId
        }));

        dispatch('endAttack');
    }

    function removePlayerCard({ state }, cardId) {
        const cardInZoneIndex = state.playerCardsInZone.findIndex(c => c.id === cardId);
        if (cardInZoneIndex >= 0) {
            state.playerCardsInZone.splice(cardInZoneIndex, 1);
        }
        else {
            const cardInOpponentZoneIndex = state.playerCardsInOpponentZone.findIndex(c => c.id === cardId);
            if (cardInOpponentZoneIndex >= 0) {
                state.playerCardsInOpponentZone.splice(cardInOpponentZoneIndex, 1);
            }
        }
    }

    function moveFlippedStationCardToZone({ dispatch }, stationCardId) {
        dispatch('putDownCard', { location: 'zone', cardId: stationCardId });
    }

    function discardDurationCard({ state }, cardData) {
        matchController.emit('discardDurationCard', cardData.id);
        state.playerDiscardedCards.push(cardData);
        const cardIndexInZone = state.playerCardsInZone.findIndex(c => c.id === cardData.id);
        state.playerCardsInZone.splice(cardIndexInZone, 1);

        state.events.push(DiscardCardEvent({
            turn: state.turn,
            phase: state.phase,
            cardId: cardData.id,
            cardCommonId: cardData.commonId
        }));
    }

    function opponentRetreated() {
        deleteMatchLocalDataAndReturnToLobby();
    }

    function deleteMatchLocalDataAndReturnToLobby() {
        localStorage.removeItem('ongoing-match');
        route('lobby');
    }
}

function stationCardsByIsFlippedComparer(a, b) {
    return (a.flipped ? 1 : 0) - (b.flipped ? 1 : 0);
}