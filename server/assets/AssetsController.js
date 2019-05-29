const path = require('path');

module.exports = function (deps) {
    return {
        getIcon,
        getImage,
        getSound
    };

    function getIcon(req, res) {
        const iconName = req.params.iconName;
        const filePath = path.join(__dirname, 'icons', iconName);
        res.sendFile(filePath);
    }

    function getImage(req, res) {
        const imageName = req.params.imageName;
        const filePath = path.join(__dirname, 'images', imageName);
        res.sendFile(filePath);
    }

    function getSound(req, res) {
        const imageName = req.params.soundName;
        const filePath = path.join(__dirname, 'sounds', imageName);
        res.sendFile(filePath);
    }
};
