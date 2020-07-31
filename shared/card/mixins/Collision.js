module.exports = (_attackBonus) => (superclass) =>
  class Collision extends superclass {
    get canCollide() {
      return true;
    }

    get attackBonus() {
      return _attackBonus;
    }
  };
