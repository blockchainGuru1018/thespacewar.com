const {
    defaults
} = require('./bocha-jest/bocha-jest.js');
const Player = require('./Player.js');
const GameConfig = require('../../../shared/match/GameConfig.js');
const CardDataAssembler = require('../../../shared/CardDataAssembler.js');
const CardInfoRepository = require('../../../shared/CardInfoRepository.js');
const Match = require('../../match/Match.js');

module.exports = function createMatch(deps = {}, testCardData = []) {
    if (deps.players && deps.players.length === 1) {
        deps.players.push(Player('P2A'));
    }
    const rawCardDataRepository = { get: () => testCardData };
    const cardDataAssembler = CardDataAssembler({ rawCardDataRepository });
    defaults(deps, {
        gameConfig: GameConfig({ amountOfCardsInStartHand: 7 }),
        cardInfoRepository: CardInfoRepository({ cardDataAssembler }),
        rawCardDataRepository,
        players: [Player('P1A'), Player('P2A')],
        logger: {
            log: (...args) => {
                console.log(...args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 4) : a))
            }
        }
    });
    return Match(deps);
};
