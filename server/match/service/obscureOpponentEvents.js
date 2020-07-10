const TheShade = require("../../../shared/card/TheShade.js");

module.exports = function (events) {
  return events.filter((e) => {
    if (e.type === "attack" && e.cardCommonId === TheShade.CommonId)
      return true;
    if (e.type === "putDownCard") {
      if (e.location === "zone") return true;
      if (e.location.startsWith("station-") && e.putDownAsExtraStationCard)
        return true;
    }

    return false;
  });
};
