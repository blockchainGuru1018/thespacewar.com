const canThePlayerFactory = require("./fakeFactories/canThePlayerFactory");
const queryEventsFactory = require("./fakeFactories/queryEventsFactory");
const playerStateServiceFactory = require("./fakeFactories/playerStateServiceFactory");

const {
    defaults
} = require('bocha');

module.exports = {
    createCard
};

function createCard(Constructor, options = {}) {
    defaults(options, {
        canThePlayer: canThePlayerFactory.withStubs(),
        queryEvents: queryEventsFactory.withStubs(),
        playerStateService: playerStateServiceFactory.withStubs(),
        cardAttackBoost: { forCardType: () => 0 },
    });
    return new Constructor(options);
}
