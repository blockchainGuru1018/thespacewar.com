const path = require("path");

module.exports = function (deps) {
    return {
        getFont,
        getIcon,
        getImage,
        getSound,
        getLibrary,
    };

    function getFont(req, res) {
        const fontName = req.params.fontName;
        const filePath = path.join(__dirname, "fonts", fontName);
        res.sendFile(filePath);
    }

    function getIcon(req, res) {
        const iconName = req.params.iconName;
        const filePath = path.join(__dirname, "icons", iconName);
        res.sendFile(filePath);
    }

    function getImage(req, res) {
        const imageName = req.params.imageName;
        const filePath = path.join(__dirname, "images", imageName);
        res.sendFile(filePath);
    }

    function getSound(req, res) {
        const imageName = req.params.soundName;
        const filePath = path.join(__dirname, "sounds", imageName);
        res.sendFile(filePath);
    }

    function getLibrary(req, res) {
        const libraryName = req.params.libraryName;
        const filePath = path.join(__dirname, "libraries", libraryName);
        res.sendFile(filePath);
    }
};
