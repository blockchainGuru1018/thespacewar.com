const { defaults } = require('bocha');

module.exports = FakeCardDataAssembler;

FakeCardDataAssembler.createCard = function (options = {}) {
    return defaults(options, {
        id: 'DEFAULT_TEST_CARD_ID',
        cost: 0
    });
}

FakeCardDataAssembler.fromCards = cards => {
    return FakeCardDataAssembler({ createAll: () => [...cards] });
};

function FakeCardDataAssembler({ createAll }) {
    return {
        createAll
    }
}