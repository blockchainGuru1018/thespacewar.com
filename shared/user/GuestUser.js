const User = require('./User.js');

class GuestUser extends User {
    constructor({
        name,
        id
    }) {
        super({name, id});
    }

    static fromData(data) {
        return new GuestUser(data);
    }

    allowedInLobby() {
        return false;
    }
}

module.exports = GuestUser;