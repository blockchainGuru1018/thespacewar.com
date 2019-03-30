const Source = require('./Source.js');

class DeckSource extends Source {

    fetch() {
        return this._playerStateService.getCardsInDeck().filter(this._cardFilter);
    }

    name() {
        return 'Deck';
    }
}

module.exports = DeckSource;