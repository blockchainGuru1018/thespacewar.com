<template>
    <div class="field-playerCardsOnHand field-section">
        <div :style="getCardHoverActivatorStyle(card, index)"
             @click.stop="playerCardClick(card)"
             @mouseenter="mouseEnterCardAtIndex(index)"
             @mouseleave="mouseLeaveCardAtIndex(index)"
             class="cardHoverActivator"
             v-for="card, index in playerVisibleCardsOnHand"
             v-if="!holdingCard"/>
        <div :style="getCardHoverBlowUpStyle(card, index)"
             @click.stop="playerCardClick(card)"
             @mouseenter="mouseEnterCardAtIndex(index)"
             @mouseleave="mouseLeaveCardAtIndex(index)"
             class="cardHoverBlowUp"
             v-for="card, index in playerVisibleCardsOnHand"
             v-if="!holdingCard && index === hoveringOverCardAtIndex"/>
        <div
                :class="getPlayerCardClasses(card)"
                :style="getCardOnHandStyle(card, index)"
                @click="switchCardClick(card)"
                v-for="card, index in playerVisibleCardsOnHand"
                v-if="card !== holdingCard"
        />
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
        data() {
            return {
                hoveringOverCardAtIndex: -1
            };
        },
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
            switchCardClick(card) {
                if (this.holdingCard) {
                    this.$emit('cardClick', card);
                }
            },
            playerCardClick(card) {
                if (this.canMoveCardsFromHand) {
                    this.hoveringOverCardAtIndex = false;
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
            getCardImageUrl(card) {
                const cardUrl = getCardImageUrl.byCommonId(card.commonId);
                return cardUrl;
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
                    backgroundImage: `url(${cardUrl})`,
                    opacity: index === this.hoveringOverCardAtIndex ? 0 : 1
                }
            },
            getCardHoverActivatorStyle(card, index) {
                const cardCount = this.playerCardsOnHand.length;
                const turnDistance = 80;
                const startDegrees = -((cardCount - 1) * turnDistance * .5);
                let degrees = index * turnDistance;
                const number = startDegrees + degrees
                return {
                    left: `${number}px`
                }
            },
            getCardHoverBlowUpStyle(card, index) {
                const cardUrl = getCardImageUrl.byCommonId(card.commonId);

                const cardCount = this.playerCardsOnHand.length;
                const turnDistance = 80;
                const startDegrees = -((cardCount - 1) * turnDistance * .5);
                let degrees = index * turnDistance;
                const number = startDegrees + degrees
                return {
                    left: `${number}px`,
                    backgroundImage: `url(${cardUrl})`
                }
            },
            mouseEnterCardAtIndex(index) {
                this.hoveringOverCardAtIndex = index;
            },
            mouseLeaveCardAtIndex(index) {
                if (this.hoveringOverCardAtIndex === index) {
                    this.hoveringOverCardAtIndex = -1;
                }
            }
        }
    };
</script>