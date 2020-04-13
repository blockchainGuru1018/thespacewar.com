const ajax = require('../utils/ajax.js');

module.exports = function () {
    return {
        getConfiguration
    };

    async function getConfiguration() {
        return await ajax.get('/config');
    }
};
