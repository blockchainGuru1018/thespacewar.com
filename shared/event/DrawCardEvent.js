function DrawCardEvent({ turn, byEvent = false }) {
    return {
        type: 'drawCard',
        created: new Date().toISOString(),
        turn,
        byEvent
    };
}

module.exports = DrawCardEvent;