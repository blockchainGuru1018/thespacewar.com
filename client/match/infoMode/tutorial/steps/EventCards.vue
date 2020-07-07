<template>
  <div class="infoMode-step">
    <h2>There is actually a fifth card type...</h2>
    <p>
      <span class="event">Event cards</span>
      are never played in your home zone, but are instead activated. Their
      abilities vary a lot and if they cost 0 action points they can be played
      at any time, even outside your action phase, even during your opponents
      turn!
    </p>
  </div>
</template>
<script>
export default {
  name: "EventCards",
  extraDark: true,
};
</script>
<style lang="scss" scoped>
.event {
  color: #c78111;
}
</style>
