function AddCardToDrawPileTopEvent({ turn, phase, cardId, cardCommonId }) {
  return {
    type: AddCardToDrawPileTopEvent.Type,
    created: Date.now(),
    turn,
    phase,
    cardId,
    cardCommonId,
  };
}

AddCardToDrawPileTopEvent.Type = "addCardToDrawPileTop";

module.exports = AddCardToDrawPileTopEvent;
