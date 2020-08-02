module.exports = function ({ attackerCard, defenderCard, usingCollision }) {
  const defenderCurrentDamage = defenderCard.damage;
  const defenderTotalDefense = defenderCard.defense - defenderCurrentDamage;
  const cardAttack = attackerCard.attack;
  return {
    attackerDestroyed: attackerCard.type === "missile" || usingCollision,
    defenderDestroyed: cardAttack >= defenderTotalDefense,
    defenderDamage: defenderCurrentDamage + cardAttack,
  };
};
