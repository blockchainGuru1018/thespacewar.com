class UserAuth {
  constructor({ id, username, country, rating = 0 }) {
    this._id = id;
    this._username = username;
    this._country = country;
    this._rating = rating;
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  get username() {
    return this._username;
  }

  set username(value) {
    this._username = value;
  }

  get country() {
    return this._country;
  }

  set country(value) {
    this._country = value;
  }

  get rating() {
    return this._rating;
  }

  set rating(value) {
    this._rating = value;
  }
}

module.exports = UserAuth;
