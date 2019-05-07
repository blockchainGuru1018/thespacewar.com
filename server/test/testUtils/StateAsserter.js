const {
    assert,
    sinon
} = require('bocha');

module.exports = StateAsserter;

function StateAsserter(gameMatch, playerConnection, playerId) {

    return {
        start,
        hasStationCard,
        hasRequirement
    };

    function start() {
        gameMatch.refresh(playerId);
    }

    function hasStationCard(cardId) {
        assert.calledWith(playerConnection.restoreState, sinon.match({
            stationCards: sinon.match.some(sinon.match({ id: cardId }))
        }));
    }

    function hasRequirement(requirement) {
        assert.calledWith(playerConnection.restoreState, sinon.match({
            requirements: sinon.match([sinon.match(requirement)])
        }));
    }
}