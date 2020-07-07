const hashCookie = require("./hashCookie.js");

class LoginCookieString {
  id(id) {
    this._id = id;
    return this;
  }

  username(username) {
    this._username = username;
    return this;
  }

  country(country) {
    this._country = country;
    return this;
  }

  rating(rating) {
    this._rating = rating;
    return this;
  }

  generateHash() {
    this._hash = hashCookie(
      this._id,
      this._username,
      this._country,
      this._rating
    );
    return this;
  }

  create() {
    return `${this._id}:${this._username}:${this._country}:${this._rating}:${this._hash}`;
  }
}

module.exports = LoginCookieString;
