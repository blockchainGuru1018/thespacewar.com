module.exports = function (deps) {

    const cardFactory = deps.cardFactory;

    const cards = cardFactory.createAll();

    return {
        getCost
    }

    function getCost(cardId) {
        const card = cards.find(c => c.id === cardId);
        if (!card) throw new Error(`Could not find card with id: ${cardId}`);

        return parseInt(card.cost, 10);
    }
};