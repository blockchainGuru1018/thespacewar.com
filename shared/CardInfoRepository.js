module.exports = function (deps) {

    const cardDataAssembler = deps.cardDataAssembler;

    let cards = null;

    return {
        getCost,
        getImageUrl,
        getType
    }

    function getCost(cardCommonId) {
        const card = getCard(cardCommonId);
        return parseInt(card.cost, 10);
    }

    function getType(cardCommonId) {
        return getCard(cardCommonId).type;
    }

    function getImageUrl(cardCommonId) {
        return `/card/${cardCommonId}/image`;
    }

    function getCard(cardCommonId) {
        const card = getCards().find(c => c.commonId === cardCommonId);
        if (!card) {
            console.error(`Could not find card with ID ${cardCommonId}`);
            return {};
        }
        else {
            return card;
        }
    }

    function getCards() {
        if (!cards) {
            cards = cardDataAssembler.createAll();
        }

        return cards;
    }
};