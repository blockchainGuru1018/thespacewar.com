<template>
    <div class="field-playerCardsOnHand field-section">
        <div :class="getPlayerCardClasses(card)"
             :style="getCardOnHandStyle(card, index)"
             @click="playerCardClick(card)"
             v-for="card, index in playerVisibleCardsOnHand"
             v-if="card !== holdingCard"/>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const getCardImageUrl = require("../utils/getCardImageUrl.js");
    const { mapState } = Vuex.createNamespacedHelpers('match');
    const { mapGetters: mapPermissionGetters } = Vuex.createNamespacedHelpers('permission');
    const { mapState: mapCardState } = Vuex.createNamespacedHelpers('card');

    module.exports = {
        props: ['holdingCard'],
        computed: {
            ...mapState([
                'playerCardsOnHand'
            ]),
            ...mapCardState([
                'hiddenCardIdsOnHand',
            ]),
            ...mapPermissionGetters([
                'canMoveCardsFromHand',
            ]),
            playerVisibleCardsOnHand() {
                return this.playerCardsOnHand.filter(card => !this.hiddenCardIdsOnHand.some(id => id === card.id));
            }
        },
        methods: {
            playerCardClick(card) {
                if (this.canMoveCardsFromHand) {
                    this.$emit('cardClick', card);
                }
            },
            getPlayerCardClasses(card) {
                const classes = ['card'];
                if (card.highlighted) {
                    classes.push('card--highlight');
                }
                if (!this.holdingCard) {
                    classes.push('card--hoverable');
                }
                return classes;
            },
            getCardOnHandStyle(card, index) {
                const cardUrl = getCardImageUrl.byCommonId(card.commonId);

                const cardCount = this.playerCardsOnHand.length;
                const turnDistance = 1.5;
                const startDegrees = -((cardCount - 1) * turnDistance * .5);
                let degrees = index * turnDistance;
                return {
                    transform: 'rotate(' + (startDegrees + degrees) + 'deg)',
                    transformOrigin: 'center 1600%',
                    backgroundImage: `url(${cardUrl})`
                }
            }
        }
    };
</script>
<style scoped lang="scss">
    @import "match";
</style>