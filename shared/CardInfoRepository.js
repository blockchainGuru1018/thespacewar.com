module.exports = function (deps) {

    const cardDataAssembler = deps.cardDataAssembler;

    const cards = cardDataAssembler.createAll();

    return {
        getCost,
        getType
    }

    function getCost(cardCommonId) {
        const card = getCard(cardCommonId);
        return parseInt(card.cost, 10);
    }

    function getType(cardCommonId) {
        return getCard(cardCommonId).type;
    }

    function getCard(cardCommonId) {
        const card = cards.find(c => c.commonId === cardCommonId);
        if (!card) throw new Error(`Could not find card with id: ${cardCommonId}`);
        return card;
    }
};