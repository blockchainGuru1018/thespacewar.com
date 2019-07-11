const Bot = require('./Bot.js');
const Vuex = require('vuex');

module.exports = function ({
    userRepository
}) {

    return {
        create
    };

    function create() {
        const rootStore = new Vuex.store({});
        return Bot({
            userRepository,
            rootStore
        });
    }
};
