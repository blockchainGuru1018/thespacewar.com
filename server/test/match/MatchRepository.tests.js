const {
    testCase,
    assert,
    defaults,
    stub
} = require('bocha');
const MatchRepository = require('../../match/MatchRepository.js');
const User = require("../../user/User.js");

let keysBefore = [];

module.exports = testCase('MatchRepository', {
    setUp() {
        keysBefore = Object.keys(this);
    },
    tearDown() {
        const keysAfter = Object.keys(this);
        for (const key of keysAfter) {
            if (!keysBefore.includes(key)) {
                delete this[key];
            }
        }
    },
    'create match': {
        'when create match for player and opponent': {
            async setUp() {
                this.opponentSocketConnection = { emit: stub() };
                const fakeMatch = FakeMatch({
                    id: 'M1A',
                    toClientModel: () => 'FAKE_CLIENT_MODEL'
                });
                const repository = Repository({
                    socketRepository: {
                        hasConnectionToUser: () => true,
                        getForUser: id => id === 'P2A' ? this.opponentSocketConnection : null
                    },
                    userRepository: FakeUserRepository([{ id: 'P1A' }, { id: 'P2A' }]),
                    matchFactory: { create: () => fakeMatch }
                });

                this.result = await repository.create({ playerId: 'P1A', opponentId: 'P2A' });
            },
            'should return match client model'() {
                assert.equals(this.result, 'FAKE_CLIENT_MODEL');
            },
            'should emit match/create on opponent users socket'() {
                assert.calledWith(this.opponentSocketConnection.emit, 'match/create', 'FAKE_CLIENT_MODEL');
            }
        },
        'when player is already in a game': {
            async setUp() {
                this.opponentSocketConnection = { emit: stub() };
                const repository = Repository({
                    socketRepository: {
                        hasConnectionToUser: () => true,
                        getForUser: id => id === 'P2A' ? this.opponentSocketConnection : null
                    },
                    userRepository: FakeUserRepository([{ id: 'P1A' }, { id: 'P2A' }, { id: 'P3A' }]),
                    matchFactory: FakeMatchFactory()
                });
                await repository.create({ playerId: 'P1A', opponentId: 'P2A' });

                this.error = await catchError(() => repository.create({ playerId: 'P1A', opponentId: 'P3A' }));
            },
            'should throw error'() {
                assert(this.error);
                assert.equals(this.error.message, 'Player is already in a match');
            }
        },
        'when opponent is already in a game': {
            async setUp() {
                this.opponentSocketConnection = { emit: stub() };
                const repository = Repository({
                    socketRepository: {
                        hasConnectionToUser: () => true,
                        getForUser: id => id === 'P2A' ? this.opponentSocketConnection : null
                    },
                    userRepository: FakeUserRepository([{ id: 'P1A' }, { id: 'P2A' }, { id: 'P3A' }]),
                    matchFactory: FakeMatchFactory()
                });
                await repository.create({ playerId: 'P3A', opponentId: 'P2A' });

                this.error = await catchError(() => repository.create({ playerId: 'P1A', opponentId: 'P2A' }));
            },
            'should throw error'() {
                assert(this.error);
                assert.equals(this.error.message, 'Opponent is already in a match');
            }
        },
        'when create match and then its ended': {
            async setUp() {
                this.opponentSocketConnection = { emit: stub() };
                const fakeMatch = FakeMatch({
                    id: 'M1A',
                    toClientModel: () => 'FAKE_CLIENT_MODEL'
                });
                let endMatchCallback = null;
                this.userRepository = FakeUserRepository([{ id: 'P1A' }, { id: 'P2A' }]);
                const repository = Repository({
                    socketRepository: {
                        hasConnectionToUser: () => true,
                        getForUser: id => id === 'P2A' ? this.opponentSocketConnection : null
                    },
                    userRepository: this.userRepository,
                    matchFactory: {
                        create({ endMatch }) {
                            endMatchCallback = endMatch;
                            return fakeMatch;
                        }
                    }
                });

                await repository.create({ playerId: 'P1A', opponentId: 'P2A' });
                endMatchCallback('M1A');
            },
            'should register that player exited match'() {
                const user = { exitedMatch: stub() };
                this.userRepository.updateUser.getCall(2).args[1](user);
                assert.calledOnce(user.exitedMatch);
            },
            'should register that opponent exited match'() {
                const user = { exitedMatch: stub() };
                this.userRepository.updateUser.getCall(3).args[1](user);
                assert.calledOnce(user.exitedMatch);
            }
        },
        'when opponent has connection but does not exist in user repository': async function () {
            const repository = Repository({
                socketRepository: { hasConnectionToUser: () => true },
                userRepository: FakeUserRepository([{ id: 'P1A' }])
            });

            const error = await catchError(() => repository.create({ playerId: 'P1A', opponentId: 'P2A' }));

            assert(error);
            assert.equals(error.message, 'Some users for the match does not exist');
        }
    },
    'reconnect:': {
        'when match that not exist should throw': async function () {
            const repository = Repository({});

            const error = await catchError(() => repository.reconnect({ playerId: 'P1A', matchId: 'M1A' }));

            assert(error);
            assert.equals(error.message, 'Cannot find match for player');
        },
        'when match exists': {
            async setUp() {
                this.newConnection = stub();
                this.opponentSocketConnection = { emit: stub() };
                this.fakeMatch = FakeMatch({
                    id: 'M1A',
                    toClientModel: () => 'FAKE_CLIENT_MODEL',
                    updatePlayer: stub()
                });
                this.userRepository = FakeUserRepository([{ id: 'P1A' }, { id: 'P2A' }]);
                const repository = Repository({
                    socketRepository: {
                        hasConnectionToUser: () => true,
                        getForUser: id => id === 'P2A'
                            ? this.opponentSocketConnection
                            : this.newConnection
                    },
                    userRepository: this.userRepository,
                    matchFactory: { create: () => this.fakeMatch }
                });
                await repository.create({ playerId: 'P1A', opponentId: 'P2A' });

                await repository.reconnect({ playerId: 'P1A', matchId: 'M1A' });
            },
            'should have updated the player connection'() {
                assert.calledWith(this.fakeMatch.updatePlayer, 'P1A', { connection: this.newConnection });
            },
            'should register that user entered match'() {
                const user = { enteredMatch: stub() };
                this.userRepository.updateUser.firstCall.args[1](user);
                assert.calledOnce(user.enteredMatch);
            }
        },
    },
});

function Repository(deps) {
    return MatchRepository(defaults(deps, {
        userRepository: {},
        socketRepository: {},
        matchFactory: FakeMatchFactory()
    }));
}

async function catchError(callback) {
    try {
        await callback();
    }
    catch (error) {
        return error;
    }
}

function FakeUserRepository(users) {
    return {
        getUser(id) {
            const userData = users.find(u => u.id === id);
            if (!userData) return null;

            return User.fromData(userData);
        },
        updateUser: stub()
    };
}

function FakeMatch(stubs) {
    return {
        id: null,
        toClientModel: () => ({}),
        updatePlayer() {},
        ...stubs
    }
}

function FakeMatchFactory() {
    return {
        create: () => FakeMatch()
    }
}
