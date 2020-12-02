<template>
  <div :class="classes" class="windowedOverlay">
    <div class="dimOverlay-content">
    </div>
  </div>
</template>

<script>
module.exports = {
  data() {
    return {
      hideOverlay: false,
    };
  },
  computed: {
    classes() {
      const classes = ["dimOverlay blueColor"];
      if (this.hideOverlay) {
        classes.push("dimOverlay--hidden");
      }
      return classes;
    },
  },
  methods: {
    toggleOverlay() {
      this.hideOverlay = !this.hideOverlay;
    },
  },
};
</script>