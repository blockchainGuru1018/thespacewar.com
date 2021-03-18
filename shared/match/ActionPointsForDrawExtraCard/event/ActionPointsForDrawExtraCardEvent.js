module.exports = function ({ turn }) {
  return {
    type: "actionPointsForDrawExtraCard",
    turn,
  };
};
