<template>
    <div
        class="opponentPreGameOverlay"
        :style="overlayStyle"
    >
        <div class="opponentPreGameOverlay-status">
            {{ text }}
        </div>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const matchHelpers = Vuex.createNamespacedHelpers('match');

    module.exports = {
        data() {
            return {
                opacity: 0,
                pointerEvents: 'auto'
            };
        },
        computed: {
            ...matchHelpers.mapState([
                'opponentUser',
                'readyPlayerIds'
            ]),
            ...matchHelpers.mapGetters([
                'gameOn',
                'selectingStartingStationCards'
            ]),
            overlayStyle() {
                return {
                    opacity: this.opacity,
                    pointerEvents: this.pointerEvents
                }
            },
            isOpponentReady() {
                return this.readyPlayerIds.includes(this.opponentUser.id);
            },
            text() {
                if (this.isOpponentReady) {
                    return 'Opponent is ready';
                }
                return 'Opponent is getting ready';
            }
        },
        watch: {
            gameOn() {
                if (this.gameOn) {
                    this.opacity = 0;
                    this.pointerEvents = 'none';
                }
            },
            selectingStartingStationCards() {
                if (this.selectingStartingStationCards) {
                    this.opacity = 1;
                }
            }
        }
    };
</script>
<style scoped lang="scss">
    .opponentPreGameOverlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 2;
        background: rgba(0, 0, 0, .7);
        display: flex;
        justify-content: center;
        align-items: center;
        transition: opacity .25s ease-out;
    }

    .opponentPreGameOverlay-status {
        font-size: 35px;
        color: rgb(120, 120, 120);
        font-family: "Space mono", sans-serif;
    }
</style>
