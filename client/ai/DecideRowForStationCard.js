const rows = ['draw', 'action', 'handSize'];

module.exports = function () {
    return () => randomInList(rows);
};

function randomInList(list) {
    return list[randomInRange(0, list.length - 1)];
}

function randomInRange(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}
