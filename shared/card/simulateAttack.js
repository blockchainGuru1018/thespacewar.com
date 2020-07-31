module.exports = function (attackerCard, defenderCard) {
  const defenderCurrentDamage = defenderCard.damage;
  const defenderTotalDefense = defenderCard.defense - defenderCurrentDamage;
  const cardAttack = attackerCard.attack;
  return {
    attackerDestroyed:
      attackerCard.type === "missile" || attackerCard._card.usingCollision,
    defenderDestroyed: cardAttack >= defenderTotalDefense,
    defenderDamage: defenderCurrentDamage + cardAttack,
  };
};
