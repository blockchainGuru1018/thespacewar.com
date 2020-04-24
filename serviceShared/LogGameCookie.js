const md5 = require('md5');
const qs = require('querystring');
class LogGameCookie {
    _salt = 'dPef39f¤ef#!Dce3';
    constructor(user_won, user_lost, length) {
        console.log(user_won);

        this.user_won = user_won;
        this.user_lost = user_lost;
        this.length = length;

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

function logGame(user_won, user_lost, length) {
    return new LogGameCookie(user_won, user_lost, length)
}

module.exports.logGame = logGame;