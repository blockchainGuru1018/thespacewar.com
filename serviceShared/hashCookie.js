const md5 = require("md5");

const Salt = "dgRdfkWMfGWJdE¤53d8P63h";

module.exports = function hashCookie(id, username, country, rating) {
    return md5(`${id}${username}${country}${rating}${Salt}`);
};
