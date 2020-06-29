const AllCards = require('../AllCards.js');

const infoByCardCommonId = {};
AllCards.forEach(Card => {
    if (Card.Info) {
        infoByCardCommonId[Card.CommonId] = Card.Info;
    }
});

module.exports = infoByCardCommonId;
