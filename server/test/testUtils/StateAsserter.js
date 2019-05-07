const {
    assert,
    sinon
} = require('bocha');

module.exports = StateAsserter;

function StateAsserter(gameMatch, playerConnection, playerId) {

    return {
        send,
        hasStationCard,
        hasRequirement
    };

    function send() {
        gameMatch.refresh(playerId);
    }

    function hasStationCard(cardId) {
        assert.calledWith(playerConnection.stateChanged, sinon.match({
            stationCards: sinon.match.some(sinon.match({ id: cardId }))
        }));
    }

    function hasRequirement(requirement) {
        assert.calledWith(playerConnection.stateChanged, sinon.match({
            requirements: sinon.match([sinon.match(requirement)])
        }));
    }
}
