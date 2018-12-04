module.exports = function (deps) {

    const cardDataAssembler = deps.cardDataAssembler;

    const deck = cardDataAssembler.createAll();
    shuffle(deck);

    return {
        drawSingle,
        draw
    };

    function drawSingle() {
        return draw(1)[0];
    }

    function draw(count) {
        let cards = [];
        for (let i = 0; i < count; i++) {
            let topCard = deck.pop();
            cards.push(topCard);
        }
        cards.reverse();
        return cards;
    }
};

function shuffle(array) {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
}