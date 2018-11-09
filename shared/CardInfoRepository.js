module.exports = function (deps) {

    const cardFactory = deps.cardFactory;

    const cards = cardFactory.createAll();

    return {
        getCost
    }

    function getCost(cardCommonId) {
        const card = cards.find(c => c.commonId === cardCommonId);
        if (!card) throw new Error(`Could not find card with id: ${cardCommonId}`);

        return parseInt(card.cost, 10);
    }
};