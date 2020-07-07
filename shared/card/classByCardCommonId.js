const AllCards = require("./AllCards.js");

const classByCardCommonId = {};
AllCards.forEach((c) => {
    classByCardCommonId[c.CommonId] = c;
});

module.exports = classByCardCommonId;
