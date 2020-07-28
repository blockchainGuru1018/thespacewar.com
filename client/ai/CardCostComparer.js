module.exports = function ({ expensiveFirst = false } = {}) {
  return (a, b) =>
    expensiveFirst
      ? b.costToPlay - a.costToPlay
      : a.costToPlay - b.costToPlay;
};
