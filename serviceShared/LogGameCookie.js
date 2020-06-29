const md5 = require('md5');
const qs = require('querystring');
class LogGameCookie {
    constructor(user_won, user_lost, length) {
        this.user_won = user_won;
        this.user_lost = user_lost;
        this.length = length;

        this._salt = 'dPef39f¤ef#!Dce3';
    }

    hash() {
        return md5(`${this.user_won}${this.user_lost}${this.length}${this._salt}`)
    }

    postData() {
        return qs.stringify({
            user_won: this.user_won,
            user_lost: this.user_lost,
            length: this.length,
            hash: this.hash()
        });
    }
}

module.exports = LogGameCookie;