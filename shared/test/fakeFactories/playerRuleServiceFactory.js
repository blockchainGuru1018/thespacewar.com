module.exports = {
  withStubs,
};

function withStubs(stubs = {}) {
  return {
    canPutDownEventCards: () => true,
    canPutDownCardsInHomeZone: () => true,
    ...stubs,
  };
}
