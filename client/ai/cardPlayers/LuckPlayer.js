const Luck = require('../../../shared/card/Luck.js');

module.exports = function ({
    matchController
}) {

    return {
        forCard,
        play
    };

    function forCard({ commonId }) {
        return commonId === Luck.CommonId;
    }

    function play(card) {
        matchController.emit('putDownCard', { cardId: card.id, location: 'zone', choice: 'draw' });
    }
};
