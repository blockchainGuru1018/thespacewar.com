const {
    assert,
    sinon
} = require('bocha');

module.exports = StateAsserter;

function StateAsserter(gameMatch, playerConnection, playerId) {

    return {
        send,
        hasStationCard,
        hasUnflippedStationCard,
        hasDiscardedCard,
        hasCardInZone,
        countMatchingAttacks,
        hasRequirement
    };

    function send() {
        gameMatch.refresh(playerId);
    }

    function hasDiscardedCard(cardId) {
        assert.calledWith(playerConnection.stateChanged, sinon.match({
            discardedCards: sinon.match.some(sinon.match({ id: cardId }))
        }));
    }

    function hasCardInZone(cardId) {
        assert.calledWith(playerConnection.stateChanged, sinon.match({
            cardsInZone: sinon.match.some(sinon.match({ id: cardId }))
        }));
    }

    function countMatchingAttacks(count, attackEvent) {
        const state = playerConnection.stateChanged.lastCall.args[0];
        const matchingAttacks = state.events.filter(event => sinon.match(attackEvent).test(event));

        const actualCount = matchingAttacks.length;
        assert.equals(actualCount, count, `Expected to find ${count} matching attack event but found ${actualCount}.`);
    }

    function hasStationCard(cardId) {
        assert.calledWith(playerConnection.stateChanged, sinon.match({
            stationCards: sinon.match.some(sinon.match({ id: cardId }))
        }));
    }

    function hasUnflippedStationCard(cardId) {
        assert.calledWith(playerConnection.stateChanged, sinon.match({
            stationCards: sinon.match.some(sinon.match({ id: cardId, flipped: sinon.match.undefined }))
        }));
    }

    function hasRequirement(requirement) {
        assert.calledWith(playerConnection.stateChanged, sinon.match({
            requirements: sinon.match([sinon.match(requirement)])
        }));
    }
}
