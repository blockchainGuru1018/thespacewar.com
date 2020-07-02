module.exports = function ({ expensiveFirst = false } = {}) {
    return (a, b) => expensiveFirst
        ? b.cost - a.cost
        : a.cost - b.cost;
};
