<template>
  <div class="modal-backdrop">
    <div class="modal">
      <header class="modal-header">
        <slot name="header">
          This is the default tile!
        </slot>
      </header>
      <section class="modal-body">
        <slot name="body">
          I'm the default body!
        </slot>
      </section>
      <footer class="modal-footer">
        <slot name="footer">
          I'm the default footer!
        </slot>
      </footer>
    </div>
  </div>
</template>
<script>
export default {
  name: "ConfirmationDialog",
  methods: {
    close() {
      this.$emit("close");
    },
    confirm() {
      this.$emit("confirm");
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  color: #fff;
  font-family: "Space Mono", monospace;
  letter-spacing: 0.18em;
  z-index: 9999;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 20px 0;
  background: linear-gradient(to bottom, #0a0a14, #140a0a);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  overflow-x: auto;
}

.modal-header,
.modal-footer {
  padding-left: 15px;
  padding-right: 15px;
  display: flex;
}

.modal-header {
  justify-content: space-between;
}

.modal-footer {
  justify-content: flex-end;
}

.modal-body {
  position: relative;
  padding: 20px 10px;
}
</style>
