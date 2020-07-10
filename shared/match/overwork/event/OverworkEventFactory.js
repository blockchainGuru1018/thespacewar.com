const OverworkEvent = require("./OverworkEvent.js");

module.exports = function ({ matchService, playerStateService }) {
  return {
    createAndStore,
    create,
  };

  function createAndStore() {
    const event = create();
    playerStateService.storeEvent(event);
  }

  function create() {
    const turn = matchService.getTurn();
    return OverworkEvent({ turn });
  }
};
