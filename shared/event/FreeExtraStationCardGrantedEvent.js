module.exports = FreeExtraStationCardGrantedEvent;

function FreeExtraStationCardGrantedEvent({ turn, count }) {
  return {
    type: "freeExtraStationCardGranted",
    turn,
    count,
  };
}
