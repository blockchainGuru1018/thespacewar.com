const path = require('path');
const fs = require('fs');

module.exports = function () {
    return {
        onPush
    };

    async function onPush(req, res) {
        fs.writeFileSync(path.join(__dirname, '..', '..', 'temp', '.PUSH_AVAILABLE'));
        res.end();
    }
};