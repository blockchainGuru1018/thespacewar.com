const LoginCookie = require('../../serviceShared/LoginCookie.js');

class CookieVerifier {
    constructor(sessionCookie) {
        this.sessionCookie = sessionCookie;
    }

    isLoggedIn() {
        return new LoginCookie(this.sessionCookie).verify();
    }
}

module.exports = CookieVerifier;