<template>
  <div class="infoMode-step">
    <h2>Card types</h2>
    <p>
      <span class="missile">Missile</span>
      cards do not need to move to your opponents home zone to attack there.
    </p>
    <p>
      <span class="defense">Defense cards</span>
      cannot move and can only attack cards in your home zone.
    </p>
    <p>
      <span class="spaceShip">Spaceships</span>
      can move and attack.
    </p>
    <p>
      <span class="duration">Duration cards</span>
      can not be attacked but costs their price in action points every turn.
      They can be discarded at the beginning of your action phase.
    </p>
  </div>
</template>
<script>
export default {
  name: "CardTypes2",
  extraDark: true,
};
</script>
<style lang="scss" scoped>
.defense {
  color: #1da71d;
}

.duration {
  color: #b257b9;
}

.spaceShip {
  color: #3a9fc6;
}

.missile {
  color: #ca1616;
}
</style>
