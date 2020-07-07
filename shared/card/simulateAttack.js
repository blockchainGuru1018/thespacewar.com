module.exports = function (attackerCard, defenderCard) {
  const defenderCurrentDamage = defenderCard.damage;
  const defenderTotalDefense = defenderCard.defense - defenderCurrentDamage;
  const cardAttack = attackerCard.attack;
  return {
    attackerDestroyed: attackerCard.type === "missile",
    defenderDestroyed: cardAttack >= defenderTotalDefense,
    defenderDamage: defenderCurrentDamage + cardAttack,
  };
};
