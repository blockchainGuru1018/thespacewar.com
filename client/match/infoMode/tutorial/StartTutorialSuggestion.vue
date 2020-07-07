<template>
  <div class="infoMode-step">
    <h2 id="startTutorialText">
      Start Tutorial
    </h2>
  </div>
</template>
<script>
import LinesMixin from "./LinesMixin";

export default {
  name: "StartTutorialSuggestion",
  mixins: [LinesMixin([["#startTutorialText", ".toggleInfoMode"]])],
};
</script>

<style scoped></style>
