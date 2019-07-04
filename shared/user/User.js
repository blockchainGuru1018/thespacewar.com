class User {

    constructor({ name, id, inMatch = false }) {
        this.name = name;
        this.id = id;
        this.inMatch = inMatch;
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
            inMatch: this.inMatch
        };
    }

    enteredMatch() {
        this.inMatch = true;
    }

    exitedMatch() {
        this.inMatch = false;
    }
}

module.exports = User;
