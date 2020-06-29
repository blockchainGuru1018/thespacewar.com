const cardsJson = require('../../server/card/rawCardData.cache.json').data;

module.exports = function (cards = cardsJson) {
    return { init() { }, get: () => cards };
};
