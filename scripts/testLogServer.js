const LogGameCookie = require('../serviceShared/LogGameCookie.js');
const axios = require('axios');

run();

async function run() {
    try {
        const result = await successTest();
        console.log('GOT A RESULT: ', result);
    } catch (error) {
        console.log('GOT AN ERROR: ', error);
    }
}

function successTest() {
    return postScore('https://thespacewar.com/log-game', 8, 4, 5 * 60 * 1000);
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
