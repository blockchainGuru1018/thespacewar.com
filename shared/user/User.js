class User {

    constructor({name, country = 'se', rating = 0, id, created = Date.now(), inMatch = false, isConnected = false}) {
        this.rating = rating;
        this.name = name;
        this.country = country;
        this.id = id;
        this.inMatch = inMatch;
        this.inMatchEndingScreen = false;
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
            country: this.country,
            rating: this.rating,
            id: this.id,
            inMatch: this.inMatch,
            isConnected: this.isConnected,
            created: this.created,
            inMatchEndingScreen: this.inMatchEndingScreen,
            allowedInLobby: this.allowedInLobby(),
        };
    }

    enteredMatch() {
        this.inMatch = true;
    }

    exitedMatch() {
        this.inMatch = false;
        this.inMatchEndingScreen = true;
    }

    exitedMatchEndingScreen() {
        this.inMatchEndingScreen = false;
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
        return true && !this.inMatchEndingScreen;
    }
}

module.exports = User
