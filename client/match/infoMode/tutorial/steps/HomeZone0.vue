<template>
  <div class="infoMode-step">
    <h2>Home zone</h2>
    <p id="infoMode-homeZone" style="text-align: center;">
      This is your home zone.
    </p>
  </div>
</template>
<script>
import LinesMixin from "../LinesMixin.js";

export default {
  name: "HomeZone0",
  mixins: [LinesMixin([["#infoMode-homeZone", ".opponentCardsInPlayerZone"]])],
};
</script>
