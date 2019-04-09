class Source {

    constructor({ specFilter, playerStateService }) {
        this._specFilter = specFilter;
        this._playerStateService = playerStateService;
    }

    fetch() {
        return [];
    }

    name() {
        return 'unknown';
    }

    _cardFilter() {
        return card => {
            if (!this._cardFulfillsTypeFilter(card)) {
                return false;
            }
            return true;
        };
    }

    _cardFulfillsTypeFilter(card) {
        const hasTypeFilter = 'type' in this._specFilter;
        return hasTypeFilter && this._specFilter.type.includes(card.type);
    }
}

module.exports = Source;