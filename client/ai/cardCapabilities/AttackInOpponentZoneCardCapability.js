module.exports = function ({
    card
}) {
    return {
        canDoIt
    };

    function canDoIt() {
        return !card.inHomeZone();
    }
};
