const canThePlayerFactory = require("./fakeFactories/canThePlayerFactory");
const {
    defaults
} = require('bocha');

module.exports = {
    createCard
};

function createCard(Constructor, options = {}) {
    defaults(options, {
        canThePlayer: canThePlayerFactory.withStubs()
    });
    return new Constructor(options);
}