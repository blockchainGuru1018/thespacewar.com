const {
    assert,
    refute,
    sinon
} = require('bocha');

module.exports = StateAsserter;

function StateAsserter(gameMatch, playerConnection, playerId) {

    return {
        send,
        hasStationCard,
        hasUnflippedStationCard,
        hasStationCardInRow,
        hasDiscardedCard,
        refuteHasDiscardedCard,
        hasCardInZone,
        refuteHasCardInZone,
        countMatchingAttacks,
        hasRequirement,
        refuteHasRequirement,
        playerIsDefeated,
        noPlayerIsDefeated,
        gameHasEnded,
        gameHasNotEnded,
        hasStartedLastStandForPlayer,
        playerHasControlOfTurn,
    };

    function send() {
        gameMatch.refresh(playerId);
    }

    function hasDiscardedCard(cardId) {
        assertArrayOnStateHasSome('discardedCards', card => card.id === cardId, state => {
            return `Card with ID "${cardId}" is not in discardedCards "${json(state.cardsInZone)}"`;
        });
    }

    function refuteHasDiscardedCard(cardId) {
        refuteArrayOnStateHasSome('discardedCards', card => card.id === cardId, () => {
            return `Card with ID "${cardId}" should NOT be in discardedCards`;
        });
    }

    function hasCardInZone(cardId) {
        assertArrayOnStateHasSome('cardsInZone', card => card.id === cardId, state => {
            return `Card with ID "${cardId}" is not in cardsInZone "${json(state.cardsInZone)}"`;
        });
    }

    function refuteHasCardInZone(cardId) {
        refuteArrayOnStateHasSome('cardsInZone', card => card.id === cardId, () => {
            return `Card with ID "${cardId}" should NOT be in cardsInZone`;
        });
    }

    function countMatchingAttacks(count, attackEvent) {
        const state = playerConnection.stateChanged.lastCall.args[0];
        const matchingAttacks = state.events.filter(event => sinon.match(attackEvent).test(event));

        const actualCount = matchingAttacks.length;
        assert.equals(actualCount, count, `Expected to find ${count} matching attack event but found ${actualCount}.`);
    }

    function hasStationCard(cardId) {
        assertArrayOnStateHasSome('stationCards', stationCard => stationCard.id === cardId, state => {
            return `Station card with ID "${cardId}" is not in stationCards "${json(state.stationCards)}"`;
        });
    }

    function hasUnflippedStationCard(cardId) {
        assertArrayOnStateHasSome(
            'stationCards',
            stationCard => {
                return stationCard.id === cardId
                    && !stationCard.flipped
            },
            state => {
                return `There is NO unflipped station card in stationCards "${json(state.stationCards)}"`;
            });
    }

    function hasStationCardInRow(cardId, rowName) {
        assertArrayOnStateHasSome(
            'stationCards',
            stationCard => {
                return stationCard.id === cardId
                    && stationCard.place === rowName;
            },
            state => {
                return `There is NO station card with ID "${cardId}" in row "${rowName}" among stationCards "${json(state.stationCards)}"`;
            });
    }

    function hasRequirement(requirement) {
        refute.calledWith(playerConnection.stateChanged, sinon.match({
            requirements: []
        }));
        assert.calledWith(playerConnection.stateChanged, sinon.match({
            requirements: sinon.match.some(sinon.match(requirement))
        }));
    }

    function refuteHasRequirement(requirement) {
        refute.calledWith(playerConnection.stateChanged, sinon.match({
            requirements: sinon.match.some(sinon.match(requirement))
        }));
    }

    function playerIsDefeated(playerId) {
        assert.calledWith(playerConnection.stateChanged, sinon.match({
            retreatedPlayerId: playerId
        }));
    }

    function noPlayerIsDefeated() {
        assert.calledWith(playerConnection.stateChanged, sinon.match({
            retreatedPlayerId: null
        }));
    }

    function gameHasEnded() {
        assert.calledWith(playerConnection.stateChanged, sinon.match({
            ended: true
        }));
    }

    function gameHasNotEnded() {
        assert.calledWith(playerConnection.stateChanged, sinon.match({
            ended: false
        }));
    }

    function hasStartedLastStandForPlayer(playerId) {
        assert.calledWith(playerConnection.stateChanged, sinon.match({
            lastStandInfo: sinon.match({ playerId })
        }));
    }

    function playerHasControlOfTurn(playerId) {
        assert.calledWith(playerConnection.stateChanged, sinon.match({
            currentPlayer: playerId
        }));
    }

    function getLastChangedState() {
        return playerConnection.stateChanged.lastCall.args[0];
    }

    function assertArrayOnStateHasSome(arrayProperty, someMatcher, Message) {
        const state = getLastChangedState();
        assert(state[arrayProperty].some(someMatcher), Message(state));
    }

    function refuteArrayOnStateHasSome(property, matcher, Message) {
        const state = getLastChangedState(playerConnection.stateChanged);
        refute(state[property].some(matcher), Message(state));
    }

    function json(data) {
        return `\njson:\n${JSON.stringify(data, null, 4)}\n`;
    }
}
