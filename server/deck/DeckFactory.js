const Deck = require('./Deck.js');

module.exports = function (deps) {

    const cardFactory = deps.cardFactory;

    return {
        create
    };

    function create() {
        return Deck({ cardFactory });
    }
};