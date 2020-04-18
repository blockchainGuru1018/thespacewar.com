class User {

    constructor({ name, id, created = Date.now(), inMatch = false, isConnected = false }) {
        this.name = name;
        this.id = id;
        this.inMatch = inMatch;
        this.isConnected = isConnected;
        this.created = created;
    }

    static get MaxNameLength() {
        return 20;
    }

    static fromData(data) {
        return new User(data);
    }

    toData() {
        return {
            name: this.name,
            id: this.id,
            inMatch: this.inMatch,
            isConnected: this.isConnected,
            created: this.created,
            allowedInLobby: this.allowedInLobby(),
        };
    }

    enteredMatch() {
        this.inMatch = true;
    }

    exitedMatch() {
        this.inMatch = false;
    }

    connected() {
        this.isConnected = true;
    }

    disconnected() {
        this.isConnected = false;
    }

    timeAlive() {
        return Date.now() - this.created;
    }

    allowedInLobby() {
        return true;
    }
}

module.exports = User
