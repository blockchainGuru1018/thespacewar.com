module.exports = FakeDeck;

FakeDeck.fromCards = cards => {
    return FakeDeck({
        cardDataAssembler: {
            createAll: () => [...cards]
        }
    });
};

function FakeDeck(deps) {

    const cardDataAssembler = deps.cardDataAssembler;

    let cards = cardDataAssembler.createAll();

    return {
        draw,
        drawSingle
    }

    function drawSingle() {
        const card = cards.shift();
        if (cards.length === 0) {
            cards = cardDataAssembler.createAll();
        }
        return card;

    }

    function draw(count) {
        let result = [];
        for (let i = 0; i < count; i++) {
            result.push(drawSingle());
        }
        return result;
    }
}
