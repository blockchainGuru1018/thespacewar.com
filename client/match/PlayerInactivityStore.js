module.exports = function ({ rootStore }) {
  let intervalID;
  return {
    namespaced: true,
    name: "inactivity",
    actions: {
      init,
      stop,
    },
  };

  function init() {
    stop();
    intervalID = setInterval(() => {
      rootStore.dispatch("match/checkLastTimeOfInactivityForPlayer");
    }, 3 * 1000);
  }

  function stop() {
    if (intervalID) {
      intervalID = clearInterval(intervalID);
    }
  }
};
