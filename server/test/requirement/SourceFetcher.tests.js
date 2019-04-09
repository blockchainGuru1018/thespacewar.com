let bocha = require('bocha');
let sinon = bocha.sinon;
let testCase = bocha.testCase;
let assert = bocha.assert;
let refute = bocha.refute;
const SourceFetcher = require('../../../shared/match/requirement/SourceFetcher.js');

module.exports = testCase('SourceFetcher', {
    'can get draw station cards': function () {
        const playerStateService = {
            getDrawStationCards() {
                return [{ place: 'draw', card: { id: 'C1A' } }];
            }
        };
        const fetcher = SourceFetcher({ playerStateService });

        const cards = fetcher.drawStationCards();

        assert.equals(cards.length, 1);
        assert.match(cards[0], { id: 'C1A' });
    }
});