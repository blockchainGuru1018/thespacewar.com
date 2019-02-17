const path = require('path');

module.exports = function () {

    return {
        getImage,
        getBackImage
    };

    function getImage(req, res) {
        const cardCommonId = req.params.cardId;
        res.redirect('https://cards.thespacewar.com/card-' + cardCommonId + '.jpg');
    }

    function getBackImage(req, res) {
        const filePath = path.join(__dirname, 'image', 'back.png');
        res.sendFile(filePath);
    }
};

