const Player = require('../player/Player.js');
const Match = require('./Match.js');
const CardDataAssembler = require('../../shared/CardDataAssembler.js');
const CardInfoRepository = require('../../shared/CardInfoRepository.js');
const DeckFactory = require('../deck/DeckFactory.js');

module.exports = function ({
    socketRepository,
    rawCardDataRepository,
    gameConfig,
    logger
}) {

    const cardDataAssembler = CardDataAssembler({ rawCardDataRepository });
    const deckFactory = DeckFactory({ cardDataAssembler });
    const cardInfoRepository = CardInfoRepository({ cardDataAssembler });

    return {
        create
    };

    function create({ users, endMatch }) {
        const players = users.map(createPlayer);
        const matchId = createId();
        return Match({
            players,
            matchId,
            deckFactory,
            cardInfoRepository,
            logger,
            rawCardDataRepository,
            gameConfig,
            endMatch: () => endMatch(matchId)
        });
    }

    function createPlayer(user) {
        return Player({
            id: user.id,
            name: user.name,
            connection: socketRepository.getForUser(user.id)
        });
    }

    function createId() {
        return Math.round((Math.random() * 1000000)).toString().padStart(7, '0');
    }
};
