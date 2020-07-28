module.exports = function ({ expensiveFirst = false } = {}) {
  return (a, b) =>
    expensiveFirst
      ? b.costWithInflation - a.costWithInflation
      : a.costWithInflation - b.costWithInflation;
};
