function AddCardToHandEvent({ cardId }) {
    return {
        type: 'addCardToHand',
        created: Date.now(),
        cardId,
    };
}

module.exports = AddCardToHandEvent;
