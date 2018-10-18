const Deck = require('../deck/Deck.js');

const PHASES = ['draw', 'action', 'discard', 'attack'];

module.exports = function (deps) {

    const matchId = deps.matchId;
    const players = deps.players;

    const state = {
        playersReady: 0,
        playerState: {},
        deckByPlayerId: {
            [players[0].id]: Deck(),
            [players[1].id]: Deck(),
        },
    };

    return {
        id: matchId,
        matchId, //TODO Remove all uses
        players,
        start,
        getOwnState,
        nextPhase,
        putDownCard,
        discardCard,
        updatePlayer,
        toClientModel
    };

    function start() {
        const gameHasAlreadyStarted = state.playersReady >= players.length;
        if (gameHasAlreadyStarted) {
            for (let player of players) {
                emitRestoreStateForPlayer(player.id);
            }
        }
        else {
            state.playersReady++;
            if (state.playersReady === players.length) {
                players.forEach(player => startGameForPlayer(player.id));
                players.forEach(player => emitBeginGameForPlayer(player.id));
            }
        }
    }

    function nextPhase(playerId) {
        const state = getOwnState(playerId);
        state.phase = PHASES[PHASES.indexOf(state.phase) + 1];
    }

    function putDownCard(playerId, { location, cardId }) {
        const state = getOwnState(playerId);
        const cardIndexOnHand = state.cardsOnHand.findIndex(c => c.id === cardId);
        const card = state.cardsOnHand[cardIndexOnHand];
        const canAffordCard = state.actionPoints >= card.cost;
        if (!card || !canAffordCard) throw new Error('Invalid state - someone is cheating');
        state.cardsOnHand.splice(cardIndexOnHand, 1);
        state.actionPoints -= card.cost;

        if (location.startsWith('station')) {
            const stationLocation = location.split('-').pop();
            state.stationCards.push({ place: stationLocation, card });
        }
        else if (location === 'zone') {
            state.cardsInZone.push(card);
        }

        emitToOpponent(playerId, 'putDownOpponentCard', { location });
    }

    function discardCard(playerId, cardId) {
        const playerState = getOwnState(playerId);
        const cardIndexOnHand = playerState.cardsOnHand.findIndex(c => c.id === cardId);
        const card = playerState.cardsOnHand[cardIndexOnHand];
        if (!card) throw new Error('Invalid state - someone is cheating');
        playerState.cardsOnHand.splice(cardIndexOnHand, 1);
        playerState.actionPoints += getActionPointsFromDiscardingCard();
        playerState.discardedCards.push(card);

        const opponentId = getOpponentId(playerId);
        const opponentDeck = getOpponentDeck(playerId);
        const opponentState = getOpponentState(playerId);
        const bonusCard = opponentDeck.drawSingle();
        opponentState.cardsOnHand.push(bonusCard);
        emitToPlayer(opponentId, 'opponentDiscardedCard', {
            bonusCard,
            discardedCard: card,
            opponentCardCount: getPlayerCardCount(playerId)
        });
        emitOpponentCardCount(playerId);
    }

    function getOwnState(playerId) {
        return state.playerState[playerId];
    }

    function updatePlayer(playerId, mergeData) {
        const player = players.find(p => p.id === playerId);
        Object.assign(player, mergeData);
    }

    function emitOpponentCardCount(playerId) {
        emitToPlayer(playerId, 'setOpponentCardCount', getOpponentCardCount(playerId));
    }

    function emitRestoreStateForPlayer(playerId) {
        const data = state.playerState[playerId];
        emitToPlayer(playerId, 'restoreState', {
            ...data,
            opponentCardCount: getOpponentCardCount(playerId),
            opponentDiscardedCards: getOpponentDiscardedCards(playerId),
            opponentStationCards: getOpponentStationCards(playerId),
        });
    }

    function startGameForPlayer(playerId) {
        let playerDeck = state.deckByPlayerId[playerId];
        let stationCards = [
            { card: playerDeck.drawSingle(), place: 'draw' },
            { card: playerDeck.drawSingle(), place: 'action' },
            { card: playerDeck.drawSingle(), place: 'action' },
            { card: playerDeck.drawSingle(), place: 'action' },
            { card: playerDeck.drawSingle(), place: 'handSize' }
        ];
        let cardsOnHand = playerDeck.draw(7);
        state.playerState[playerId] = {
            cardsOnHand,
            stationCards,
            cardsInZone: [],
            discardedCards: [],
            phase: 'draw',
            actionPoints: getActionPointsFromStationCards(stationCards)
        };
    }

    function emitBeginGameForPlayer(playerId) {
        const { stationCards, cardsOnHand } = state.playerState[playerId];
        emitToPlayer(playerId, 'beginGame', {
            stationCards,
            cardsOnHand,
            opponentCardCount: getOpponentCardCount(playerId),
            opponentStationCards: getOpponentStationCards(playerId)
        });
    }

    function emitToOpponent(playerId, action, value) {
        const opponent = players.find(p => p.id !== playerId);
        emitToPlayer(opponent.id, action, value);
    }

    function emitToPlayer(playerId, action, value) {
        const player = players.find(p => p.id === playerId)
        player.connection.emit('match', { matchId, action, value });
    }

    function getActionPointsFromStationCards(stationCards) {
        return stationCards
            .filter(c => c.place === 'action')
            .length * 2;
    }

    function getActionPointsFromDiscardingCard() {
        return 2;
    }

    function toClientModel() {
        return {
            playerIds: players.map(p => p.id),
            id: matchId
        }
    }

    function getOpponentCardCount(playerId) {
        const opponentId = getOpponentId(playerId);
        return getPlayerCardCount(opponentId);
    }

    function getPlayerCardCount(playerId) {
        const playerState = state.playerState[playerId];
        return playerState.cardsOnHand.length;
    }

    function getOpponentDiscardedCards(playerId) {
        const opponentId = getOpponentId(playerId);
        return getPlayerDiscardedCards(opponentId);
    }

    function getPlayerDiscardedCards(playerId) {
        const playerState = state.playerState[playerId];
        return playerState.discardedCards;
    }

    function getOpponentStationCards(playerId) {
        const opponentState = state.playerState[getOpponentId(playerId)];
        return opponentState.stationCards.map(s => ({ place: s.place }));
    }

    function getOpponentId(playerId) {
        return players.find(p => p.id !== playerId).id;
    }

    function getOpponentState(playerId) {
        return state.playerState[getOpponentId(playerId)];
    }

    function getOpponentDeck(playerId) {
        return state.deckByPlayerId[getOpponentId(playerId)];
    }
};