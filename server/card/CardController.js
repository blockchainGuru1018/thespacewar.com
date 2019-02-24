const path = require('path');

module.exports = function ({
    rawCardDataRepository
}) {

    return {
        getImage,
        getBackImage,
        getData
    };

    function getImage(req, res) {
        const cardCommonId = req.params.cardId;
        res.redirect('https://cards.thespacewar.com/card-' + cardCommonId + '.jpg');
    }

    function getBackImage(req, res) {
        const filePath = path.join(__dirname, 'image', 'back.png');
        res.sendFile(filePath);
    }

    function getData(req, res) {
        const data = rawCardDataRepository.get();
        res.json(data);
    }
};