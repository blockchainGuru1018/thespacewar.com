<template>
  <input
    id="myRange"
    type="range"
    :min="min"
    :max="max"
    :value="sliderValue"
    class="slider"
    @input="input"
  />
</template>
<script>
module.exports = {
  props: ["value"],
  computed: {
    sliderValue() {
      return this.value * 100;
    },
    min() {
      return 0;
    },
    max() {
      return 100;
    },
  },
  methods: {
    input(event) {
      const newValue = event.target.value;
      this.$emit("input", newValue / 100);
    },
  },
};
</script>
<style></style>
