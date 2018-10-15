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
        updatePlayer,
        toClientModel
    };

    function start() {
        const gameHasAlreadyStarted = state.playersReady >= players.length;
        if (gameHasAlreadyStarted) {
            for (let player of players) {
                emitRestoreStateForPlayer(player);
            }
        }
        else {
            state.playersReady++;
            if (state.playersReady === players.length) {
                players.forEach(startGameForPlayer);
                players.forEach(emitBeginGameForPlayer);
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
        else {

        }

        emitToOpponent(playerId, 'putDownOpponentCard', { location });
    }

    function getOwnState(playerId) {
        return state.playerState[playerId];
    }

    function updatePlayer(playerId, mergeData) {
        const player = players.find(p => p.id === playerId);
        Object.assign(player, mergeData);
    }

    function emitRestoreStateForPlayer(player) {
        const data = state.playerState[player.id];
        const opponentId = getOpponentId(player.id);
        emitToPlayer(player, 'restoreState', {
            ...data,
            opponentCardCount: getOpponentCardCount(opponentId),
            opponentStationCards: getOpponentStationCards(opponentId),
        });
    }

    function startGameForPlayer(player) {
        const playerId = player.id
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
            phase: 'draw',
            actionPoints: getActionPointsFromStationCards(stationCards)
        };
    }

    function getActionPointsFromStationCards(stationCards) {
        return stationCards
            .filter(c => c.place === 'action')
            .length * 2;
    }

    function emitBeginGameForPlayer(player) {
        const { stationCards, cardsOnHand } = state.playerState[player.id];
        const opponentId = getOpponentId(player.id);
        emitToPlayer(player, 'beginGame', {
            stationCards,
            cardsOnHand,
            opponentCardCount: getOpponentCardCount(opponentId),
            opponentStationCards: getOpponentStationCards(opponentId)
        });
    }

    function emitToOpponent(playerId, action, value) {
        const opponent = players.find(p => p.id !== playerId);
        emitToPlayer(opponent, action, value);
    }

    function emitToPlayer(player, action, value) {
        player.connection.emit('match', { matchId, action, value });
    }

    function toClientModel() {
        return {
            playerIds: players.map(p => p.id),
            id: matchId
        }
    }

    function getOpponentCardCount(opponentId) {
        const opponentState = state.playerState[opponentId];
        return opponentState.cardsOnHand.length;
    }

    function getOpponentStationCards(opponentId) {
        const opponentState = state.playerState[opponentId];
        return opponentState.stationCards.map(s => ({ place: s.place }));
    }

    function getOpponentId(playerId) {
        return players.find(p => p.id !== playerId).id;
    }
};