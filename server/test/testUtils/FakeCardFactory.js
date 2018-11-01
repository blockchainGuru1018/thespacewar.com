module.exports = FakeCardFactory;

FakeCardFactory.fromCards = cards => {
    return FakeCardFactory({ createAll: () => [...cards] });
};

function FakeCardFactory({ createAll }) {
    return {
        createAll
    }
}