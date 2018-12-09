const BaseCard = require('./BaseCard.js');

const filesById = {};
for (let cardCommonId of Object.keys(BaseCard.classNameByCommonId)) {
    try {
        filesById[cardCommonId] = require(`./${BaseCard.classNameByCommonId[cardCommonId]}`);
    }
    catch (err) {
        console.error('Could not load Class file of card with common id: ' + cardCommonId + '! Got error: ' + err);
    }
}

module.exports = filesById;