const CookieVerifier = require('../utils/CookieVerifier.js');

module.exports = function ({}) {

    return {
        getAuthLoggedIn
    };

    async function getAuthLoggedIn(req, res) {
        const cookie = req.cookies.loggedin;
        const cookieVerifier = new CookieVerifier(cookie);

        res.json({isLoggedIn: cookieVerifier.isLoggedIn()});
    }
};
