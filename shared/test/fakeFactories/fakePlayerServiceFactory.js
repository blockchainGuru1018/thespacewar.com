module.exports = {
    withStubs
};

function withStubs(stubs = {}) {
    return {
        turnControl: () => ({}),
        ...stubs
    };
}
