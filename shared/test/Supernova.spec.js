const Supernova = require('../card/Supernova.js');
const Avoid = require('../card/Avoid.js');
const {createCard} = require('./testUtils/shared.js');

test('when opponent has Avoid in play should NOT be able to player Supernova', () => {
    const card = new createCard(Supernova, {
        queryBoard: {
            opponentHasCardInPlay: (matcher) => matcher({ commonId: Avoid.CommonId })
        }
    });
    expect(card.canBePlayed()).toBe(false);
});
