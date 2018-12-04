const Deck = require('./Deck.js');

module.exports = function (deps) {

    const cardDataAssembler = deps.cardDataAssembler;

    return {
        create
    };

    function create() {
        return Deck({ cardDataAssembler });
    }
};