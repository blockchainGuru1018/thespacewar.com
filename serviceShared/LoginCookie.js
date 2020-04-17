const md5 = require('md5');

class LoginCookie {
    _salt = 'dgRdfkWMfGWJdE¤53d8P63h';

    constructor(cookieString) {
        const cookieParts = cookieString.split(':');

        this.id = cookieParts[0];
        this.username = cookieParts[1];
        this.country = cookieParts[2];
        this.rating = cookieParts[3];
        this._cookieHash = cookieParts[4];
    }

    hash() {
        return md5(`${this.id}${this.username}${this.country}${this.rating}${this._salt}`);
    }

    verify() {
        return this.hash() === this._cookieHash;
    }
}

module.exports = LoginCookie;