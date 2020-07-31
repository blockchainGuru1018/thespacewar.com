const BaseCard = require("./BaseCard.js");
const Collision = require("./mixins/Collision.js");

module.exports = class CollisionSkill extends Collision(3)(BaseCard) {
  static get CommonId() {
    return "92";
  }
};
