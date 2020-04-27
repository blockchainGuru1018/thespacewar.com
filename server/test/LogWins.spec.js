const setupIntegrationTest = require('./testUtils/setupIntegrationTest.js');

describe('log winner after game', () => {
    test('when SECOND player won should register win', () => {
        const registerLogGame = jest.fn().mockImplementation(() => Promise.resolve());
        const {match} = setupIntegrationTest({
            playerStateById: {
                'P1A': {
                    stationCards: []
                },
                'P2A': {
                    stationCards: [stationCard({id: 'S2A'})]
                }
            }
        }, {matchDeps: {registerLogGame}});

        match.refresh('P1A');

        expect(registerLogGame).toBeCalledWith('P2A', 'P1A', expect.any(Number));
    });

    test('when FIRST player won should register win', () => {
        const registerLogGame = jest.fn().mockImplementation(() => Promise.resolve());
        const {match} = setupIntegrationTest({
            playerStateById: {
                'P1A': {
                    stationCards: [stationCard({id: 'S2A'})]
                },
                'P2A': {
                    stationCards: []
                }
            }
        }, {matchDeps: {registerLogGame}});

        match.refresh('P1A');

        expect(registerLogGame).toBeCalledWith('P1A', 'P2A', expect.any(Number));
    });
});

function catchError(callback) {
    try {
        callback();
    } catch (error) {
        return error;
    }
}

function stationCard({place = 'draw', flipped = false, id}) {
    return {
        place,
        flipped,
        card: {id}
    };
}
