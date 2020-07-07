function TurnControlEvent({ type }) {
    return {
        type,
        created: Date.now(),
    };
}

TurnControlEvent.takeControlOfOpponentsTurn = (created = null) => {
    const event = TurnControlEvent({ type: "takeControlOfOpponentsTurn" });
    if (created) {
        event.created = created;
    }
    return event;
};

TurnControlEvent.releaseControlOfOpponentsTurn = (created = null) => {
    const event = TurnControlEvent({ type: "releaseControlOfOpponentsTurn" });
    if (created) {
        event.created =
            typeof created === "string" ? Date.parse(created) : created;
    }
    return event;
};

module.exports = TurnControlEvent;
