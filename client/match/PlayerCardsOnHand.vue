<template>
    <div class="field-playerCardsOnHand field-section">
        <div v-if="!holdingCard"
             v-for="card, index in playerVisibleCardsOnHand"
             :data-index="index"
             :style="getCardHoverActivatorStyle(card, index)"
             @click.stop="playerCardClick(card)"
             @mouseenter="mouseEnterCardAtIndex(index)"
             @mouseleave="mouseLeaveCardAtIndex(index)"
             class="cardHoverActivator cardOnHand"
             ref="cardHoverActivator"/>
        <div v-if="!holdingCard && index === hoveringOverCardAtIndex"
             v-for="card, index in playerVisibleCardsOnHand"
             :data-index="index"
             :style="getCardHoverBlowUpStyle(card, index)"
             @click.stop="playerCardClick(card)"
             @mouseenter="mouseEnterCardAtIndex(index)"
             @mouseleave="mouseLeaveCardAtIndex(index)"
             class="cardHoverBlowUp"
             ref="cardHoverBlowUp"/>
        <div v-if="card !== holdingCard"
             v-for="card, index in playerVisibleCardsOnHand"
             :class="getPlayerCardClasses(card)"
             :style="getCardOnHandStyle(card, index)"
             @click="switchCardClick(card)"/>
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
                return classes;
            },
            getCardImageUrl(card) {
                return getCardImageUrl.byCommonId(card.commonId);
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
        },
        mounted() {
            const dragLooseThreshold = 50;

            let startY = 0;
            const onTouchStart = e => {
                startY = e.touches[0].clientY;
                onTouchMove(e);
            };

            const onTouchMove = e => {
                if (this.holdingCard) return;

                if (e.touches[0].clientY < (startY - dragLooseThreshold)) {
                    this.$emit('cardClick', this.playerVisibleCardsOnHand[this.hoveringOverCardAtIndex]);
                    this.hoveringOverCardAtIndex = -1;
                    return;
                }

                let touchedElement = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
                const activator = this.$refs.cardHoverActivator.find(activator => activator === touchedElement);
                if (activator) {
                    this.hoveringOverCardAtIndex = parseInt(activator.dataset.index);
                }
                else {
                    this.hoveringOverCardAtIndex = -1;
                }
            };

            document.addEventListener('touchstart', onTouchStart);
            document.addEventListener('touchmove', onTouchMove);
        }
    };
</script>