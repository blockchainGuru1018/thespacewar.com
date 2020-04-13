const UserAuth = require("../../shared/user/UserAuth.js");
const CookieManager = require('../utils/CookieManager.js');
module.exports = function ({}) {

    return {
        getAuthLoggedIn
    };

    async function getAuthLoggedIn(req, res) {
        return res.send(req.body.cookies);

    }
};
