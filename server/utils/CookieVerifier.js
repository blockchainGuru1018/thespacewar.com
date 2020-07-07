const LoginCookie = require("../../serviceShared/LoginCookie.js");

class CookieVerifier {
    constructor(sessionCookie) {
        this.sessionCookie = sessionCookie;
    }

    isLoggedIn() {
        const loginCookie = LoginCookie.loginCookieFromRawCookieStringOrNull(
            this.sessionCookie
        );

        return loginCookie.verify();
    }
}

module.exports = CookieVerifier;
