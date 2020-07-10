module.exports = function () {
  return {
    serialize,
    parse,
  };

  function serialize(state) {
    return JSON.stringify({ ...state });
  }

  function parse(stateJson) {
    let restoredState = JSON.parse(stateJson);
    let [firstPlayer, secondPlayer] = restoredState.playerOrder;

    restoredState.playerStateById = {
      [firstPlayer]: restoredState.playerStateById[firstPlayer],
      [secondPlayer]: restoredState.playerStateById[secondPlayer],
    };

    return restoredState;
  }
};
