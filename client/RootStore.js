const Vuex = require('vuex');

module.exports = function (deps) {

    return new Vuex.Store({
        state: {
            test: 'this_is_a_test'
        }
    });
}