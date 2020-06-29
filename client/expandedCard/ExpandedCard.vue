<template>
    <div
        v-if="cardData || commander"
        ref="expandedCard"
        class="expandedCard"
        tabindex="0"
        @keydown.esc="hideExpandedCard"
        @click.self="hideExpandedCard"
    >
        <img
            :src="cardImageUrl"
            class="expandedCard-image"
            alt="expanded card image"
        >
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const expandedCardHelpers = Vuex.createNamespacedHelpers('expandedCard');

    module.exports = {
        computed: {
            ...expandedCardHelpers.mapState([
                'cardData',
                'commander'
            ]),
            ...expandedCardHelpers.mapGetters([
                'cardImageUrl'
            ])
        },
        watch: {
            cardData() {
                if (this.cardData) {
                    setTimeout(() => {
                        this.$refs.expandedCard.focus();
                    });
                }
            },
            commander() {
                if (this.commander) {
                    setTimeout(() => {
                        this.$refs.expandedCard.focus();
                    });
                }
            }
        },
        methods: {
            ...expandedCardHelpers.mapActions([
                'hideExpandedCard'
            ])
        }
    }
</script>
<style scoped lang="scss">
    @import "../match/cardVariables";

    .expandedCard {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: 3;
        display: flex;
        justify-content: center;
        align-items: center;
        background: rgba(0, 0, 0, .8);
    }

    .expandedCard-image {
        width: $expandedCardWidth;
        height: $expandedCardHeight;
        pointer-events: none;
    }
</style>
