<template>
  <div :class="classes" >
    <div class="dimOverlay-content">
      <slot />
    </div>
    <div class="dimOverlay-topRightButtons">
      <slot name="topRightButtons"></slot>
      <button
        class="dimOverlay-toggleOverlay darkButton--onlyLook"
        @click="toggleOverlay"
      >
        Toggle overlay
      </button>
    </div>
    <div v-show="waiting" class="waiting">
      <div class="dots">
        Waiting
      <span>.</span>
      <span>.</span>
      <span>.</span>
      </div>
    </div>
  </div>
</template>
<script>
module.exports = {
  props:{
   waiting: {
     required: false,
     default: false,
   } 
  },
  data() {
    return {
      hideOverlay: false,
    };
  },
  computed: {
    classes() {
      const classes = ["dimOverlay"];
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
