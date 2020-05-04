const axios = require('axios');
const serverRuntimeGlobals = require('../../serverRuntimeGlobals.js');

module.exports = function () {
    return {
        retrieveCurrentRank
    };

    async function retrieveCurrentRank() {
        return postRank(rankUrl());
    }
};

function rankUrl() {
    return serverRuntimeGlobals.isRunningInTestEnvironment ? 'http://localhost:8083/leader-board' : 'https://thespacewar.com/leader-board';
}

async function postRank(url) {
    console.log('POST RANK: retrieve rank');
    return axios.post(url);
}
