const {
    assert,
    refute,
    sinon
} = require('./testUtils/bocha-jest/bocha-jest.js');
const FakeCardDataAssembler = require('../../shared/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const FatalError = require('../../shared/card/FatalError.js');
const setupIntegrationTest = require('./testUtils/setupIntegrationTest.js');

test('when finish a game and player is the winner should log game', () => {
    //TODO WRITE TEST
    expect(true).toBe(true);
    //const registerLogGame = jest.fn();
  //  const { match } = setupIntegrationTest({}, {matchDeps: {registerLogGame}});
//
  //  match.retreat('P2A');
//
    //expect(registerLogGame).toBeCalledWith();
});

function catchError(callback) {
    try {
        callback();
    }
    catch (error) {
        return error;
    }
}

function stationCard({ place = 'draw', flipped, id }) {
    return {
        place,
        flipped,
        card: { id }
    };
}
