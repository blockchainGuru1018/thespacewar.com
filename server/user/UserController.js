let LogGame = require("../../serviceShared/LogGameCookie.js");
const axios = require('axios');
const UserBuilder = require('../../shared/user/UserBuilder.js');
const User = require("../../shared/user/User.js");
const LoginCookie = require('../../serviceShared/LoginCookie.js');

module.exports = function ({
    userRepository,
    gameConfig
}) {

    return {
        login,
        guestLogin,
        sendLogGame,
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

    async function sendLogGame(req, res) {
        /*user_won, user_lost, length, hash*/
        let logGameCookie = await new LogGame.logGame(req.body.user_won, req.body.user_lost, req.body.length);
        let response = await axios.post('https://thespacewar.com/log-game', logGameCookie.buildPostData());
        res.json(JSON.stringify(response))
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
        const user = new UserBuilder()
            .name(validUsernameFromCookie(req))
            .country(countryFromLoginCookie(req))
            .rating(ratingFromLoginCookie(req))
            .build();
        return userRepository.addUserAndClearOldUsers(
            user,
            req.body.secret,
            retrieveRawCookie(req)
        );
    }

    async function setupGuestUser(req) {
        const user = new UserBuilder()
            .name(validGuestUsername(req))
            .asGuest()
            .build();
        return userRepository.addGuestUser(user, req.body.secret);
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
        return loginCookieFromRequest(req).username;
    }

    function countryFromLoginCookie(req) {
        return loginCookieFromRequest(req).country;
    }

    function ratingFromLoginCookie(req) {
        return loginCookieFromRequest(req).rating;
    }

    function loginCookieFromRequest(req) {
        return LoginCookie.loginCookieFromRawCookieStringOrNull(retrieveRawCookie(req));
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
