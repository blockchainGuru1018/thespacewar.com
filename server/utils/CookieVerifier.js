const md5 = require('md5');

class CookieVerifier {
    hash = 'dgRdfkWMfGWJdE¤53d8P63h';
    sessionData = {};

    constructor(sessionCookie) {
        this.sessionCookie = sessionCookie;
    }

    isLoggedIn() {
        let cookieSplit = this.sessionCookie.split(':');
        if (cookieSplit[4] !== md5(`${cookieSplit[0]}${cookieSplit[1]}${cookieSplit[2]}${cookieSplit[3]}${this.hash}`)) {
            return false;
        }

        this.sessionData = {
            id: cookieSplit[0],
            username: cookieSplit[1],
            country: cookieSplit[2],
            rating: cookieSplit[3],
        };

        return true;
    }
}

module.exports = CookieVerifier;