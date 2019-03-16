const Deck = require('../../server/deck/Deck.js');
const CardDataAssembler = require('../../shared/CardDataAssembler.js');

const MAGIC_NUMBER_TO_GET_DECK_SIZE_RIGHT = 0;

module.exports = function getDeckSize(rawCardDataRepository) {
    return Deck({ cardDataAssembler: CardDataAssembler({ rawCardDataRepository }) }).getCardCount() - MAGIC_NUMBER_TO_GET_DECK_SIZE_RIGHT;
};