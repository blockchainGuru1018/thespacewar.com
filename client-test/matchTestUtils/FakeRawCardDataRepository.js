const cardsJson = require('../../server/card/rawCardData.cache.json').data;

module.exports = function () {
    return { init() { }, get: () => cardsJson };
};
