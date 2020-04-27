const axios = require('axios');
const MatchRegisterLog = require('../match/service/MatchRegisterLog.js');
const LogGameCookie = require('../../serviceShared/LogGameCookie.js');
const serverRuntimeGlobals = require('../serverRuntimeGlobals.js');

jest.mock('axios');
jest.mock('../serverRuntimeGlobals.js', () => ({isRunningInTestEnvironment: false}));

afterEach(jest.clearAllMocks);

test('should log score with user cookie ids and correct hash', async () => {
    axios.post.mockResolvedValue({});
    const userRepository = {
        getUserCookieId: userId => {
            if (userId === 'U1') return 'C1';
            if (userId === 'U2') return 'C2';
            throw new Error('Incorrect user ID to getUserCookieId');
        }
    }
    const matchRegisterLog = MatchRegisterLog({
        userRepository
    });

    await matchRegisterLog.registerLogGame('U1', 'U2', 1);

    const logGameCookie = new LogGameCookie('C1', 'C2', 1);
    expect(axios.post).toBeCalledWith('https://thespacewar.com/log-game', logGameCookie.postData(), expect.any(Object));
});

test('when is running in test environment should log score to fake url', async () => {
    serverRuntimeGlobals.isRunningInTestEnvironment = true;
    axios.post.mockResolvedValue({});
    const userRepository = {
        getUserCookieId: userId => {
            if (userId === 'U1') return 'C1';
            if (userId === 'U2') return 'C2';
            throw new Error('Incorrect user ID to getUserCookieId');
        }
    }
    const matchRegisterLog = MatchRegisterLog({
        userRepository
    });

    await matchRegisterLog.registerLogGame('U1', 'U2', 1);

    const logGameCookie = new LogGameCookie('C1', 'C2', 1);
    expect(axios.post).toBeCalledWith('http://localhost:8082/fake-score', logGameCookie.postData(), expect.any(Object));
})

test('when both user cookie IDs are the same should throw', async () => {
    axios.post.mockResolvedValue({});
    const userRepository = {
        getUserCookieId: userId => {
            if (userId === 'U1') return 'SAME_COOKIE';
            if (userId === 'U2') return 'SAME_COOKIE';
            throw new Error('Incorrect user ID to getUserCookieId');
        }
    }
    const matchRegisterLog = MatchRegisterLog({
        userRepository
    });

    const error = await catchError(() => matchRegisterLog.registerLogGame('U1', 'U1', 1));

    expect(axios.post).not.toBeCalled();
    expect(error.message).toBe('Cannot log game between the same users');
})

async function catchError(callback) {
    try {
        await callback();
    } catch (error) {
        return error;
    }
}