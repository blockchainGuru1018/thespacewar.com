const Player = require('../player/Player.js');
const Match = require('./Match.js');
const CardDataAssembler = require('../../shared/CardDataAssembler.js');
const CardInfoRepository = require('../../shared/CardInfoRepository.js');
const DeckFactory = require('../deck/DeckFactory.js');

module.exports = function ({
    logger,
    userRepository,
    socketRepository,
    rawCardDataRepository
}) {

    const cardDataAssembler = CardDataAssembler({ rawCardDataRepository });
    const deckFactory = DeckFactory({ cardDataAssembler });
    const cardInfoRepository = CardInfoRepository({ cardDataAssembler });

    const matchById = new Map();
    const matchByUserId = new Map();

    return {
        create,
        reconnect,
        getById,
        getForUser
    };

    async function create({ playerId, opponentId }) {
        if (!socketRepository.hasConnectionToUser(opponentId)) {
            throw new Error('Opponent player is not connected');
        }

        const playerUsers = await Promise.all([
            userRepository.getById(playerId),
            userRepository.getById(opponentId)
        ]);
        const players = playerUsers.map(user => {
            return Player({
                id: user.id,
                name: user.name,
                connection: socketRepository.getForUser(user.id)
            });
        });

        let matchId = createId();
        let match = Match({
            players,
            matchId,
            deckFactory,
            cardInfoRepository,
            logger,
            rawCardDataRepository,
            endMatch: () => end(matchId)
        });
        matchById.set(matchId, match);
        matchByUserId.set(playerId, match);
        matchByUserId.set(opponentId, match);

        let matchClientModel = match.toClientModel();
        let opponentSocket = socketRepository.getForUser(opponentId);
        opponentSocket.emit('match/create', matchClientModel);
        return matchClientModel;
    }

    async function reconnect({ playerId, matchId }) {
        console.log(' -- reconnecting user to match', playerId, matchId);
        const match = await getById(matchId);
        const connection = socketRepository.getForUser(playerId);
        match.updatePlayer(playerId, { connection });
    }

    function end(matchId) {
        matchById.delete(matchId);
        let idsToRemove = [];
        matchByUserId.forEach((match, userId) => {
            if (match.id === matchId) {
                idsToRemove.push(userId);
            }
        });
        idsToRemove.forEach(id => matchByUserId.delete(id));
    }

    function getById(id) {
        return matchById.get(id) || null;
    }

    function getForUser(userId) {
        return matchByUserId.get(userId);
    }

    function createId() {
        return Math.round((Math.random() * 1000000)).toString().padStart(7, '0');
    }
};