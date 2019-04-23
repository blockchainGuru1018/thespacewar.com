const getCardImageUrl = require("../utils/getCardImageUrl.js");

module.exports = function () {
    return {
        namespaced: true,
        name: 'expandedCard',
        state: {
            cardData: null
        },
        getters: {
            cardImageUrl
        },
        actions: {
            expandCard,
            hideExpandedCard
        }
    };

    function cardImageUrl(state) {
        return getCardImageUrl.byCommonId(state.cardData.commonId);
    }

    function expandCard({ state }, cardData) {
        state.cardData = cardData;
    }

    function hideExpandedCard({ state }) {
        state.cardData = null;
    }
};
