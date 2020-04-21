const LoginCookie = require("./LoginCookie.js");

let md5 = require('md5');

class LogGameCookie {
    constructor(user_won, user_lost, length) {
        console.log(user_won);

        this.user_won = user_won;
        this.user_lost = user_lost;
        this.length = length;

    }
    getSalt() {
        return LoginCookie.loginCookieFromRawCookieStringOrNull(null)._salt
    }

    hash() {
        return md5(`${this.user_won}${this.user_lost}${this.length}${this.getSalt()}`)
    }

    buildPostData() {
        return {
            user_won: this.user_won,
            user_lost: this.user_lost,
            length: this.length,
            hash: this.hash(),
        };
    }
}

function logGame(user_won, user_lost, length) {
    return new LogGameCookie(user_won, user_lost, length)
}

module.exports.logGame = logGame;