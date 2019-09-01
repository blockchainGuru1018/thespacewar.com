const CardInfoRepository = require('../../shared/CardInfoRepository.js');

module.exports = function FakeCardInfoRepository(cards) {
    let cardDataAssembler = {
        createAll: () => cards.map(c => createCard(c))
    };
    return CardInfoRepository({ cardDataAssembler });
};
