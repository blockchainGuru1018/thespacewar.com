class User {

    constructor({ name, id, inMatch = false, isConnected = false }) {
        this.name = name;
        this.id = id;
        this.inMatch = inMatch;
        this.isConnected = isConnected;
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
            isConnected: this.isConnected
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
}

module.exports = User;
