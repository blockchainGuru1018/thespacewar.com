const GlobalConfig = require("../../../config.json");

module.exports = function () {
  return {
    maxStationCards: () =>
      GlobalConfig.COMMANDER_FRANK_JOHNSON_MAX_STATION_CARDS,
  };
};
