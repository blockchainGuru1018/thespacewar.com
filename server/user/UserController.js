const User = require("../../shared/user/User.js");
const CookieVerifier = require('../utils/CookieVerifier.js');

module.exports = function ({
    userRepository,
    gameConfig
}) {

    return {
        login,
        testAccessKey,
        getAll
    };

    async function login(req, res) {
        if (req.body.accessKey !== gameConfig.accessKey()) new Error('Wrong key');

        //Verify cookie
        const cookieVerifier = new CookieVerifier(req.headers.cookie.loggedin);
        if(!cookieVerifier.isLoggedIn()) {
            throw new Error('Unauthorized cookie');
        }

        const name = cookie.trim().slice(0, User.MaxNameLength);
        const user = await userRepository.addUserAndClearOldUsers(name, req.body.secret, cookie);
        res.json(user);
    }

    function testAccessKey(req, res) {
        res.json({ valid: req.body.key === gameConfig.accessKey() });
    }

    async function getAll(req, res) {
        const users = await userRepository.getAll();
        res.json(users);
    }
};
