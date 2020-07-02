module.exports = function (types) {
    return (a, b) => types.indexOf(a.type) - types.indexOf(b.type);
};
