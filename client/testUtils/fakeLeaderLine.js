module.exports = {
    setupFakeLeaderLine
};

function setupFakeLeaderLine() {
    window.LeaderLine = FakeLeaderLine;
}

function FakeLeaderLine() {
    return { remove() {} };
}
