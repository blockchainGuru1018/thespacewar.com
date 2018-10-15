const path = require('path');
const cardsJson = require('./cards.json');

module.exports = function () {

    return {
        getImage
    };

    function getImage(req, res) {
        const cardId = req.params.cardId;
        const cardJson = cardsJson.find(c => c.id === cardId);
        const imageName = getImageNameFromCardUrl(cardJson.image_card);
        const filePath = path.join(__dirname, 'image', imageName);
        res.sendFile(filePath);
    }

    function getImageNameFromCardUrl(url) {
        return url.split('/').pop().split('generate_').pop();
    }
};

