<template>
  <transition name="fade-slow">
    <div v-if="showEndGameScreen" class="endGameOverlay">
      <div v-if="hasLostGame" class="defeatText endGameText">
        DEFEAT
      </div>
      <div v-else-if="hasWonGame" class="victoryText endGameText">
        VICTORY
      </div>
      <button class="endGameButton" @click="endGame">
        End game
      </button>
      <a href="https://thespacewar.com/account" class="account"
        >Account Profile</a
      >
      >
    </div>
  </transition>
</template>
<script>
export default {
  name: "EndGameHud",
  props: {
    hasLostGame: Boolean,
    hasWonGame: Boolean,
    showEndGameScreen: Boolean,
  },
  methods: {
    endGame() {
      this.$emit("endGame");
    },
  },
};
</script>
<style lang="scss" scoped>
@import "../../miscVariables";

.endGameOverlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: $overlayColor;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 4;
}

.endGameText {
  font-size: 128px;
  font-family: sans-serif;
  font-weight: bold;
  letter-spacing: 0.2em;
}

.victoryText {
  color: #66fa8b;
}

.defeatText {
  color: #ff3646;
}

.endGameButton {
  margin-top: 100px;
  background-color: transparent;
  color: #666;
  font-size: 24px;
  padding: 8px 15px;
  box-shadow: 0 1px 6px 1px rgba(0, 0, 0, 0.2);
  border: none;
  text-decoration: underline;

  &:hover {
    background-color: transparent;
    color: white;
  }
}

.account {
  color: #286aea;
  font-family: "Space Mono", inherit monospace;
  font-size: 1.5em;
  z-index: 10;
}
</style>
