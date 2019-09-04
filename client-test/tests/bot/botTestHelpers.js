const FakeState = require('../../matchTestUtils/FakeState.js');
const ClientState = require('../../../client/state/ClientState.js');
const FakeUserRepository = require('../../matchTestUtils/FakeUserRepository.js');
const FakeRawCardDataRepository = require('../../matchTestUtils/FakeRawCardDataRepository.js');
const BotSpawner = require('../../../client/ai/BotSpawner.js');
const GameConfig = require('../../../shared/match/GameConfig.js');

const BotId = 'BOT';
const PlayerId = 'P1A';

module.exports = {
    setupClientState,
    spawnBot,
    BotId,
    PlayerId
};

async function setupClientState(fakeServerState) {
    const clientState = ClientState({
        userRepository: FakeUserRepository({ ownUser: { id: BotId } }),
        opponentUser: { id: PlayerId }
    });

    const defaultedFakeServerState = defaultFakeServerState(fakeServerState);
    await clientState.update(defaultedFakeServerState);

    return clientState;
}

function defaultFakeServerState(stateOptions = {}) {
    stateOptions.playerOrder = [BotId, PlayerId];
    return FakeState(stateOptions);
}

function spawnBot({ clientState, matchController }) {
    const botSpawner = BotSpawner({
        matchController,
        clientState,
        rawCardDataRepository: FakeRawCardDataRepository(),
        userRepository: createFakeUserRepositoryToSpawnBot(clientState),
        gameConfig: GameConfig()
    });
    botSpawner.spawn();
}

function createFakeUserRepositoryToSpawnBot(clientState) {
    return {
        getUserById: id => {
            const state = clientState.read();
            if (id === state.ownUser.id) {
                return { name: 'Mr. Roboto', id: 'BOT' };
            }
            return state.opponentUser;
        }
    };
}
