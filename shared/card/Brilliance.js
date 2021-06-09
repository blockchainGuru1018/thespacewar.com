const info = require("./info/218.config.js");
const BaseCard = require("./BaseCard.js");

module.exports = class Luck extends BaseCard{
  static get CommonId() {
    return info.CommonId;
  }

  static get Info() {
    return info;
  }
};
