const md5 = require('md5');

function loginCookieFromRawCookieStringOrNull(rawCookieStringOrNull) {
    if (rawCookieStringOrNull) {
        return new LoginCookie(rawCookieStringOrNull);
    } else {
        return new InvalidCookie();
    }
}

class LoginCookie {

    constructor(cookieString) {
        const cookieParts = cookieString.split(':');

        this.id = cookieParts[0];
        this.username = cookieParts[1];
        this.country = cookieParts[2];
        this.rating = cookieParts[3];
        this._cookieHash = cookieParts[4];

        this._salt = 'dgRdfkWMfGWJdE¤53d8P63h';
    }

    hash() {
        return md5(`${this.id}${this.username}${this.country}${this.rating}${this._salt}`);
    }

    verify() {
        return this.hash() === this._cookieHash;
    }
}

class InvalidCookie extends LoginCookie {
    constructor() {
        super('0:no_name:no_country:0:no_hash');
    }

    hash() {
        throw new Error('Trying to retrieve hash from invalid cookie');
    }

    verify() {
        return false;
    }
}

module.exports = {
    loginCookieFromRawCookieStringOrNull
};