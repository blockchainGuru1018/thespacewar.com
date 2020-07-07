MoveCardEvent.hasMoved = (cardId, events) => {
    return events.some((e) => e.type === "moveCard" && e.cardId === cardId);
};

MoveCardEvent.turnCountSinceMove = (cardId, currentTurn, events) => {
    const moveCardEvent = events.find(
        (e) => e.type === "moveCard" && e.cardId === cardId
    );
    return currentTurn - moveCardEvent.turn;
};

function MoveCardEvent({ turn, cardId, cardCommonId }) {
    return {
        type: "moveCard",
        created: Date.now(),
        turn,
        cardId,
        cardCommonId,
    };
}

module.exports = MoveCardEvent;
