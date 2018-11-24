const path = require('path');
const cardsJson = require('./cards.json');

module.exports = function () {

    return {
        getImage
    };

    function getImage(req, res) {
        const cardId = req.params.cardId;
        const filePath = getFilePathFromCardId(cardId);
        res.sendFile(filePath);
    }

    function getFilePathFromCardId(cardId) {
        if (cardId.startsWith('back')) {
            return path.join(__dirname, 'image', `${cardId}.png`);
        }
        const cardJson = cardsJson.find(c => c.id === cardId);
        const imageName = getImageNameFromCardUrl(cardJson.image_card);
        return path.join(__dirname, 'image', imageName);
    }

    function getImageNameFromCardUrl(url) {
        return url.split('/').pop().split('generate_').pop();
    }
};

