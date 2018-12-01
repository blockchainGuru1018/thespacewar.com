const path = require('path');

module.exports = function (deps) {
    return {
        getIcon
    };

    function getIcon(req, res) {
        const iconName = req.params.iconName;
        const filePath = path.join(__dirname, 'icons', iconName);
        res.sendFile(filePath);
    }
};