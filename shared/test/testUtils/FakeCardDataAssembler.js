const defaults = require('lodash/defaults');

module.exports = FakeCardDataAssembler;

FakeCardDataAssembler.createCard = function (options = {}) {
    return defaults(options, {
        id: 'DEFAULT_TEST_CARD_ID',
        cost: 0
    });
};

FakeCardDataAssembler.fromCards = cards => {
    return FakeCardDataAssembler({ createAll: () => [...cards] });
};

function FakeCardDataAssembler({ createAll }) {
    return {
        createLibrary: createAll,
        createRegularDeck: createAll,
        createSwarmDeck: createAll
    }
}
