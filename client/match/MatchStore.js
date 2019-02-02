const DiscardCardEvent = require('../../shared/event/DiscardCardEvent.js');
const AttackEvent = require('../../shared/event/AttackEvent.js');
const RepairCardEvent = require('../../shared/event/RepairCardEvent.js');
const QueryEvents = require('../../shared/event/QueryEvents.js');
const ActionPointsCalculator = require('../../shared/match/ActionPointsCalculator.js');
const ClientCardFactory = require('../card/ClientCardFactory.js');
const MatchService = require("../../shared/match/MatchService");
const ClientPlayerStateService = require("./ClientPlayerStateService");
const mapFromClientToServerState = require('./mapFromClientToServerState.js');
const {
    COMMON_PHASE_ORDER,
    PHASES
} = require('./phases.js');

const storeItemNameByServerItemName = {
    cardsInZone: 'playerCardsInZone',
    cardsInOpponentZone: 'playerCardsInOpponentZone',
    discardedCards: 'playerDiscardedCards',
    cardsOnHand: 'playerCardsOnHand'
};

//TODO When move handsize station card to zone, a station card from draw station cards is removed.
// But now always. Perhaps it filters on commonId? Or two cards had the same id somehow..?
//TODO Sometimes when discarding a card in the discard phase an error is thrown in the console. Does not appear to affect gameplay.
//TODO Fix: createCard method creates card for your OWN player, and not cards for the opponent. Yet they are used even for opponent cards in ZoneCard.vue.

module.exports = function (deps) {

    const route = deps.route;
    const userRepository = deps.userRepository;
    const opponentUser = deps.opponentUser;
    const matchId = deps.matchId;
    const cardInfoRepository = deps.cardInfoRepository;
    const actionPointsCalculator = deps.actionPointsCalculator || ActionPointsCalculator({ cardInfoRepository });
    const matchController = deps.matchController;
    const clientCardFactory = deps.cardFactory || new ClientCardFactory();

    return {
        namespaced: true,
        state: {
            turn: 1,
            currentPlayer: null,
            phase: '',
            events: [],
            requirements: [],
            matchId,
            opponentUser,
            ownUser: userRepository.getOwnUser(),
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
            selectedDefendingStationCards: [],
            repairerCardId: null
        },
        getters: {
            nextPhase,
            nextPhaseWithAction,
            cardsToDrawInDrawPhase,
            actionPointsFromStationCards,
            maxHandSize,
            amountOfCardsToDiscard,
            hasPutDownNonFreeCardThisTurn,
            actionPoints2,
            attackerCard,
            attackerCanAttackStationCards,
            allPlayerCardsInOwnAndOpponentZone,
            allPlayerStationCards,
            allPlayerDurationCards,
            allOpponentStationCards,
            createCard,
            findPlayerCard,
            findPlayerCardFromAllSources,
            queryEvents,
            canPutDownCard,
            playerStateService
        },
        mutations: {
            setPlayerStationCards,
            setPlayerCardsOnHand,
            setOpponentStationCards,
            addOpponentStationCards
        },
        actions: {
            // remote
            askToDrawCard,
            askToDiscardOpponentTopTwoCards,
            saveMatch,
            restoreSavedMatch,

            // local & remote
            discardCard,
            goToNextPhase,
            setActionPoints,
            moveCard,
            retreat,
            selectStationCardAsDefender,
            discardDurationCard,
            endGame,

            // local
            stateChanged,
            restoreState,
            beginGame,
            placeCardInZone,
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
            opponentRetreated,
            registerAttack,
            removePlayerCard,
            updatePlayerCard,
            cancelAttack,
            endAttack,
            selectAsRepairer,
            selectForRepair,
            cancelCurrentAction,
            damageOwnStationCards
        }
    };

    function nextPhase(state) {
        let nextPhase = getNextPhaseValue(state.phase);
        return nextPhase || 'wait';
    }

    function nextPhaseWithAction(state, getters) {
        let nextPhase = getters.nextPhase;
        if (nextPhase === PHASES.discard && getters.amountOfCardsToDiscard === 0) {
            nextPhase = getNextPhaseValue(PHASES.discard);
        }
        if (nextPhase === PHASES.attack) {
            const someCardCanMove = state.playerCardsInZone
                .map(c => getters.createCard(c))
                .some(c => c.canMove({ phase: 'attack' }))
            const noEnemiesAndNoCardsCanMoveInHomeZone = state.opponentCardsInPlayerZone.length === 0 && !someCardCanMove;

            const someCardCanMoveInOpponentZone = state.playerCardsInOpponentZone
                .map(c => getters.createCard(c))
                .some(c => c.canMove({ phase: 'attack' }))
            const noEnemiesAndNoCardsCanMoveInOpponentZone = state.opponentCardsInZone.length === 0 && !someCardCanMoveInOpponentZone;

            const noActionsInAttackPhase =
                (state.playerCardsInZone.length === 0 || noEnemiesAndNoCardsCanMoveInHomeZone)
                && (state.playerCardsInOpponentZone.length === 0 || noEnemiesAndNoCardsCanMoveInOpponentZone);
            if (noActionsInAttackPhase) {
                nextPhase = getNextPhaseValue(PHASES.attack);
            }
        }

        return nextPhase || PHASES.wait;
    }

    function cardsToDrawInDrawPhase(state) {
        return state.playerStation.drawCards.length;
    }

    function actionPointsFromStationCards(state) {
        return state.playerStation.actionCards.length * 2;
    }

    function maxHandSize(state) {
        return state.playerStation.handSizeCards.length * 3;
    }

    function amountOfCardsToDiscard(state, getters) {
        return Math.max(0, state.playerCardsOnHand.length - getters.maxHandSize);
    }

    function hasPutDownNonFreeCardThisTurn(state) {
        return state.events.some(e =>
            e.turn === state.turn
            && e.type === 'putDownCard'
            && e.location === 'zone'
            && cardInfoRepository.getCost(e.cardCommonId) > 0);
    }

    function actionPoints2(state) { //TODO Rename "actionPoints"
        return actionPointsCalculator.calculate({
            phase: state.phase,
            turn: state.turn,
            events: state.events,
            actionStationCardsCount: state.playerStation.actionCards.length
        });
    }

    function createCard(state) {
        return (cardData, { isOpponent = false, playerId = null } = {}) => {
            return clientCardFactory.createFromVuexStore(cardData, state, { isOpponent, playerId });
        };
    }

    function findPlayerCard(state) { // TODO Rename => findPlayerCardInZones
        return cardId => {
            return state.playerCardsInZone.find(c => c.id === cardId)
                || state.playerCardsInOpponentZone.find(c => c.id === cardId)
                || null;
        }
    }

    function findPlayerCardFromAllSources(state, getters) {
        return cardId => {
            const cardInSomeZone = state.playerCardsInZone.find(c => c.id === cardId)
                || state.playerCardsInOpponentZone.find(c => c.id === cardId)
                || state.playerCardsOnHand.find(c => c.id === cardId);
            if (cardInSomeZone) return cardInSomeZone;

            const stationCard = getters.allPlayerStationCards.find(s => s.id === cardId);
            if (stationCard) return stationCard.card;

            return null;
        }
    }

    function queryEvents(state) {
        const eventRepository = {
            getAll: () => state.events
        };
        return new QueryEvents(eventRepository);
    }

    function canPutDownCard(state, getters) {
        return cardId => {
            let card = state.playerCardsOnHand.find(c => c.id === cardId);
            const canOnlyHaveOneInHomeZone = getters.createCard(card).canOnlyHaveOneInHomeZone();
            if (canOnlyHaveOneInHomeZone) {
                return !state.playerCardsInZone.some(c => c.commonId === card.commonId);
            }
            return true;
        };
    }

    function playerStateService(state, getters) {
        const matchService = new MatchService();
        const mappedState = mapFromClientToServerState(state);
        matchService.setState(mappedState);
        const updateStore = (clientState) => {
            let changedProperties = Object.keys(clientState);
            for (let property of changedProperties) {
                state[property] = clientState[property];
            }
        }
        return new ClientPlayerStateService({
            updateStore,
            playerId: state.ownUser.id,
            matchService,
            actionPointsCalculator,
            queryEvents: getters.queryEvents,
            cardFactory: clientCardFactory
        });
    }

    function playerStateService(state, getters) {
        const matchService = new MatchService();
        const mappedState = mapFromClientToServerState(state);
        matchService.setState(mappedState);
        const updateStore = (clientState) => {
            let changedProperties = Object.keys(clientState);
            for (let property of changedProperties) {
                state[property] = clientState[property];
            }
        }
        return new ClientPlayerStateService({
            updateStore,
            playerId: state.ownUser.id,
            matchService,
            actionPointsCalculator,
            queryEvents: getters.queryEvents,
            cardFactory: clientCardFactory
        });
    }

    function attackerCard(state, getters) {
        if (!state.attackerCardId) return null;

        const attackerCard = getters.allPlayerCardsInOwnAndOpponentZone.find(c => c.id === state.attackerCardId);
        return getters.createCard(attackerCard);
    }

    function attackerCanAttackStationCards(state, getters) {
        return !!getters.attackerCard && getters.attackerCard.canAttackStationCards();
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

    function allPlayerDurationCards(state) {
        return state.playerCardsInZone.filter(c => c.type === 'duration');
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

    function askToDrawCard() {
        matchController.emit('drawCard');
    }

    function askToDiscardOpponentTopTwoCards() {
        matchController.emit('discardOpponentTopTwoCards');
    }

    function saveMatch() {
        let name = prompt('Name match save:');
        matchController.emit('saveMatch', name);
    }

    function restoreSavedMatch({ state }) {
        let saveName = prompt('Restore match with name:');
        matchController.emit('restoreSavedMatch', {
            saveName,
            opponentId: state.opponentUser.id
        });
        document.body.innerHTML = '<marquee><h1>Loading...</h1></marquee>';
        setTimeout(() => window.location.reload(), 3000);
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
            requirements,
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
        state.requirements = requirements;
        state.turn = turn;
        state.currentPlayer = currentPlayer;
        state.phase = phase;
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
        const nextPhaseWithAction = getters.nextPhaseWithAction;
        const phasesToSkip = Math.max(0, getNumberOfPhasesBetween(nextPhase, nextPhaseWithAction));
        for (let i = 0; i < phasesToSkip; i++) {
            matchController.emit('nextPhase');
        }
        state.phase = nextPhaseWithAction;
        if (nextPhaseWithAction === PHASES.wait) {
            state.currentPlayer = null;
        }
        matchController.emit('nextPhase');
    }

    function placeCardInZone({ state }, card) {
        state.playerCardsInZone.push(card);
    }

    function discardCard({ state }, cardId) {
        const cardIndexOnHand = state.playerCardsOnHand.findIndex(c => c.id === cardId);
        const discardedCard = state.playerCardsOnHand[cardIndexOnHand];
        state.playerCardsOnHand.splice(cardIndexOnHand, 1);
        state.playerDiscardedCards.push(discardedCard);

        state.events.push(DiscardCardEvent({
            turn: state.turn,
            phase: state.phase,
            cardId: cardId,
            cardCommonId: discardedCard.commonId,
            isSacrifice: true
        }));
        matchController.emit('discardCard', cardId);
    }

    function setActionPoints({ state }, actionPoints) { // TODO Should be removed, all action points should be calculated through events
    }

    function moveCard({ getters }, { id }) {
        getters.playerStateService.moveCard(id);
        matchController.emit('moveCard', id);
    }

    function setOpponentCardCount({ state }, opponentCardCount) {
        state.opponentCardCount = opponentCardCount;
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

    //TODO Should NOT take "cards". This should be emitted and received by a StateChanged event
    function drawCards({ state, dispatch }, { cards = [], moreCardsCanBeDrawn }) {
        state.playerCardsOnHand.push(...cards);
        if (!moreCardsCanBeDrawn) {
            dispatch('goToNextPhase');
        }
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

    function opponentAttackedCard({ state }, {
        attackerCardId,
        defenderCardId,
        newDamage,
        attackerCardWasDestroyed,
        defenderCardWasDestroyed
    }) {
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

        if (attackerCardWasDestroyed) {
            let attackerCardInPlayerZone = state.opponentCardsInZone.find(c => c.id === attackerCardId);
            let attackerCardZone = attackerCardInPlayerZone ? state.opponentCardsInZone : state.opponentCardsInPlayerZone;
            let attackerCardIndex = attackerCardZone.findIndex(c => c.id === attackerCardId);
            attackerCardZone.splice(attackerCardIndex, 1);
        }
    }

    function cancelAttack({ dispatch }) {
        dispatch('endAttack');
    }

    function endAttack({ state }) {
        state.attackerCardId = null;
        state.selectedDefendingStationCards = [];
    }

    function selectAsRepairer({ state }, repairerCardId) {
        state.repairerCardId = repairerCardId;
    }

    function selectForRepair({ state, getters, dispatch }, cardData) {
        let repairCardData = getters.findPlayerCard(state.repairerCardId);
        let repairerCard = getters.createCard(repairCardData);
        let cardToRepair = getters.createCard(cardData);
        repairerCard.repairCard(cardToRepair);
        state.events.push(RepairCardEvent({
            turn: state.turn,
            cardId: repairerCard.id,
            cardCommonId: repairerCard.commonId,
            repairedCardId: cardToRepair.id,
            repairedCardCommonId: cardToRepair.commonId
        }));
        state.repairerCardId = null;

        dispatch('updatePlayerCard', {
            cardId: cardToRepair.id,
            updateFn: card => {
                card.damage = cardToRepair.damage;
            }
        });

        matchController.emit('repairCard', {
            repairerCardId: repairerCard.id,
            cardToRepairId: cardToRepair.id
        });
    }

    function cancelCurrentAction({ state, dispatch }) {
        if (state.attackerCardId) {
            dispatch('cancelAttack');
        }
        else if (state.repairerCardId) {
            state.repairerCardId = null;
        }
    }

    function damageOwnStationCards({}, targetIds) {
        matchController.emit('damageOwnStationCards', { targetIds });
    }

    function retreat() {
        matchController.emit('retreat');
        deleteMatchLocalDataAndReturnToLobby();
    }

    function selectStationCardAsDefender({ state, getters, dispatch }, { id }) {
        const attackerCard = getters.attackerCard;
        state.selectedDefendingStationCards.push(id);

        const unflippedStationCards = getters.allOpponentStationCards.filter(s => !s.flipped).length;
        const selectedLastStationCard = unflippedStationCards === state.selectedDefendingStationCards.length;
        const selectedMaxTargetCount = state.selectedDefendingStationCards.length >= attackerCard.attack;
        if (selectedMaxTargetCount || selectedLastStationCard) {
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

    function updatePlayerCard({ state }, { cardId, updateFn }) {
        let card = state.playerCardsInZone.find(c => c.id === cardId)
            || state.playerCardsInOpponentZone.find(c => c.id === cardId);
        if (!card) throw Error('Could not find card when trying to update it. ID: ' + cardId);

        updateFn(card);
    }

    function discardDurationCard({ state, getters, dispatch }, cardData) {
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

        if (getters.allPlayerDurationCards.length === 0) {
            dispatch('goToNextPhase');
        }
    }

    function opponentRetreated() {
        deleteMatchLocalDataAndReturnToLobby();
    }

    function endGame() {
        deleteMatchLocalDataAndReturnToLobby();
    }

    function deleteMatchLocalDataAndReturnToLobby() {
        localStorage.removeItem('ongoing-match');
        route('lobby');
    }

    function getNextPhaseValue(currentPhase) {
        return COMMON_PHASE_ORDER[COMMON_PHASE_ORDER.indexOf(currentPhase) + 1]
    }

    function getNumberOfPhasesBetween(a, b) {
        const phasesIncludingWaitInOrder = [...COMMON_PHASE_ORDER, PHASES.wait];
        return phasesIncludingWaitInOrder.indexOf(b) - phasesIncludingWaitInOrder.indexOf(a);
    }
}

function stationCardsByIsFlippedComparer(a, b) {
    return (a.flipped ? 1 : 0) - (b.flipped ? 1 : 0);
}