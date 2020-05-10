const axios = require('axios');
const qs = require('querystring');
const serverRuntimeGlobals = require('../../serverRuntimeGlobals.js');
const LogGameCookie = require('../../../serviceShared/LogGameCookie.js');

module.exports = function ({
                               userRepository
                           }) {
    return {
        registerLogGame,
        registerLogGameBot
    };

    async function registerLogGame(winnerUserId, loserUserId, gameLengthSeconds) {
        const winnerCookieUserId = userRepository.getUserCookieId(winnerUserId);
        const loserCookieUserId = userRepository.getUserCookieId(loserUserId);
        if (winnerCookieUserId === loserCookieUserId) throw new Error('Cannot log game between the same users');

        return postScore(scoreUrl(), winnerCookieUserId, loserCookieUserId, gameLengthSeconds);
    }

    async function registerLogGameBot(winnerUserId, loserUserId, gameLengthSeconds) {
        if(loserUserId !== 'BOT') {
            return;
        }

        const winnerCookieUserId = userRepository.getUserCookieId(winnerUserId);

        return postScore(scoreUrl(), winnerCookieUserId, 0, gameLengthSeconds);
    }

};

function scoreUrl() {
    return serverRuntimeGlobals.isRunningInTestEnvironment
        ? 'http://localhost:8082/fake-score'
        : 'https://thespacewar.com/log-game';
}

async function postScore(url, user_won, user_lost, length) {
    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    const logGameCookie = new LogGameCookie(user_won, user_lost, length);
    return axios.post(url, logGameCookie.postData(), config);
}
