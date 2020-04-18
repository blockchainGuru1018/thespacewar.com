const User = require("../../shared/user/User.js");
const LoginCookie = require('../../serviceShared/LoginCookie.js');

module.exports = function ({
    userRepository,
    gameConfig
}) {

    return {
        login,
        guestLogin,
        testAccessKey,
        getAll
    };

    async function login(req, res) {
        verifyAccessKey(req);
        verifyLoginCookie(req);

        const loggedInUser = await setupLoggedInUser(req);
        res.json(loggedInUser.toData());
    }

    async function guestLogin(req, res) {
        verifyAccessKey(req);

        const guestUser = await setupGuestUser(req);
        res.json(guestUser.toData());
    }

    function verifyAccessKey(req) {
        if (req.body.accessKey !== gameConfig.accessKey()) new Error('Wrong key');
    }

    function verifyLoginCookie(req) {
        const loginCookie = LoginCookie.loginCookieFromRawCookieStringOrNull(retrieveRawCookie(req));
        if (!loginCookie.verify()) {
            throw new Error('Unauthorized cookie');
        }
    }

    async function setupLoggedInUser(req) {
        return userRepository.addUserAndClearOldUsers(
            validUsernameFromCookie(req),
            req.body.secret,
            retrieveRawCookie(req)
        );
    }

    async function setupGuestUser(req) {
        return userRepository.addGuestUser(
            validGuestUsername(req),
            req.body.secret
        );
    }

    function validGuestUsername(req) {
        return validUsername(req.body.name)
    }

    function validUsernameFromCookie(req) {
        return validUsername(nameFromLoginCookie(req));
    }

    function validUsername(rawName) {
        return rawName.slice(0, User.MaxNameLength);
    }

    function nameFromLoginCookie(req) {
        return LoginCookie
            .loginCookieFromRawCookieStringOrNull(retrieveRawCookie(req))
            .username;
    }

    function retrieveRawCookie(req) {
        return req.cookies.loggedin;
    }


    function testAccessKey(req, res) {
        res.json({valid: req.body.key === gameConfig.accessKey()});
    }

    async function getAll(req, res) {
        const users = await userRepository.getAll();
        res.json(users);
    }
};
