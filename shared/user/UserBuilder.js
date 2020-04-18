const User = require('./User.js');
const GuestUser = require('./GuestUser.js');

class UserBuilder {
    constructor() {
        this._applyDefaultProperties();
    }

    _applyDefaultProperties() {
        this._name = 'Unnamed';
        this._country = 'sweden';
        this._isGuest = false;
    }

    name(name) {
        this._name = name;
        return this;
    }

    country(country) {
        this._country = country;
        return this;
    }

    asGuest() {
        this._isGuest = true;
    }

    build() {
        const constructor = this._isGuest ? GuestUser : User;
        return constructor.fromData({
            id: this._createId(),
            name: this._name,
            country: this._country
        });
    }

    _createId() {
        return Math.round((Math.random() * 1000000)).toString().padStart(7, '0');
    }
}

module.exports = UserBuilder;