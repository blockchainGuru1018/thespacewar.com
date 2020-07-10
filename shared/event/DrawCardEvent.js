function DrawCardEvent({ turn, byEvent = false }) {
  return {
    type: "drawCard",
    created: Date.now(),
    turn,
    byEvent,
  };
}

module.exports = DrawCardEvent;
