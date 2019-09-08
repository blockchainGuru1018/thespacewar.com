const FakeState = require('../../testUtils/FakeState.js');
const ClientState = require('../../state/ClientState.js');
const FakeUserRepository = require('../../testUtils/FakeUserRepository.js');
const FakeMatchController = require('../../testUtils/FakeMatchController.js');
const FakeRawCardDataRepository = require('../../testUtils/FakeRawCardDataRepository.js');
const BotSpawner = require('../../ai/BotSpawner.js');
const Bot = require('../../ai/Bot.js');
const GameConfig = require('../../../shared/match/GameConfig.js');

const BotId = 'BOT';
const PlayerId = 'P1A';

module.exports = {
    setupFromStateWithStubs,
    setupFromState,
    createMatchController,
    BotId,
    PlayerId
};

async function setupFromStateWithStubs(fakeClientState = {}, stubs = {}) {
    const clientState = await setupClientState(fakeClientState);
    const matchController = createMatchController();

    const botSpawner = BotSpawner({
        matchController,
        clientState,
        rawCardDataRepository: FakeRawCardDataRepository(),
        userRepository: createFakeUserRepositoryToSpawnBot(clientState),
        gameConfig: GameConfig(),
        createBot: options => {
            Bot({
                ...options,
                ...stubs
            });
        }
    });
    botSpawner.spawn();

    return { matchController };
}

async function setupFromState(fakeClientState = {}) {
    const clientState = await setupClientState(fakeClientState);
    const matchController = createMatchController();
    const botSpawner = BotSpawner({
        matchController,
        clientState,
        rawCardDataRepository: FakeRawCardDataRepository(),
        userRepository: createFakeUserRepositoryToSpawnBot(clientState),
        gameConfig: GameConfig()
    });
    botSpawner.spawn();

    return { matchController };
}

function createMatchController() {
    return FakeMatchController({}, { stub: jest.fn() });
}

async function setupClientState(fakeClientState) {
    const clientState = ClientState({
        userRepository: FakeUserRepository({
            ownUser: { id: BotId, name: 'Mr.Robot' },
            opponentUser: { id: PlayerId, name: 'P1B' }
        }),
        opponentUser: { id: PlayerId }
    });

    const defaultedFakeClientState = defaultFakeClientState(fakeClientState);
    await clientState.update(defaultedFakeClientState);

    return clientState;
}

function defaultFakeClientState(stateOptions = {}) {
    stateOptions.currentPlayer = stateOptions.currentPlayer || BotId;
    stateOptions.playerOrder = stateOptions.playerOrder || [BotId, PlayerId];

    return FakeState(stateOptions);
}

function createFakeUserRepositoryToSpawnBot({ ownUser, opponentUser }) {
    return {
        getUserById: id => {
            if (id === ownUser.id) {
                return { name: 'Mr. Roboto', id: 'BOT' };
            }
            return opponentUser;
        }
    };
}
