const User = require("../../shared/user/User.js");
const LoginCookie = require('../../serviceShared/LoginCookie.js');

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

        const rawCookie = req.cookies.loggedin;
        const loginCookie = LoginCookie.loginCookieFromRawCookieStringOrNull(rawCookie);
        if(!loginCookie.verify()) {
            throw new Error('Unauthorized cookie');
        }

        const name = loginCookie.username.slice(0, User.MaxNameLength);
        const user = await userRepository.addUserAndClearOldUsers(name, req.body.secret, rawCookie);
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
