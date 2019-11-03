const CardInfoRepository = require('../../shared/CardInfoRepository.js');

module.exports = function FakeCardInfoRepository(cards) {
    const cardDataAssembler = {
        createAll: () => cards.map(c => createCard(c))
    };
    return CardInfoRepository({ cardDataAssembler });
};
