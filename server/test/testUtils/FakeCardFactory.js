const { defaults } = require('bocha');

module.exports = FakeCardFactory;

FakeCardFactory.createCard = function (options = {}) {
    return defaults(options, {
        id: 'DEFAULT_TEST_CARD_ID',
        cost: 0
    });
}

FakeCardFactory.fromCards = cards => {
    return FakeCardFactory({ createAll: () => [...cards] });
};

function FakeCardFactory({ createAll }) {
    return {
        createAll
    }
}