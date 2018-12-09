function DrawCardEvent({ turn }) {
    return {
        type: 'drawCard',
        created: new Date().toISOString(),
        turn
    };
}

module.exports = DrawCardEvent;