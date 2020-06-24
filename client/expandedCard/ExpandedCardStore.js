const getCardImageUrl = require("../utils/getCardImageUrl.js");

module.exports = function () {
    return {
        namespaced: true,
        name: 'expandedCard',
        state: {
            commander: '',
            cardData: null
        },
        getters: {
            cardImageUrl
        },
        actions: {
            expandCard,
            expandCommanderCard,
            hideExpandedCard
        }
    };

    function cardImageUrl(state) {
        if (state.commander) {
            return getCardImageUrl.forCommander(state.commander);
        }

        return getCardImageUrl.byCommonId(state.cardData.commonId);
    }

    function expandCard({ state }, cardData) {
        state.cardData = cardData;
        console.log(cardData);
        state.commander = '';
    }

    function expandCommanderCard({ state }, commander) {
        state.commander = commander;
        state.cardData = null;
    }

    function hideExpandedCard({ state }) {
        state.cardData = null;
        state.commander = '';
    }
};
