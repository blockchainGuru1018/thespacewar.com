function DrawCardEvent({ turn, byEvent = false, isRecycling = false }) {
    return {
        type: 'drawCard',
        created: Date.now(),
        turn,
        byEvent,
        isRecycling
    };
}

module.exports = DrawCardEvent;
