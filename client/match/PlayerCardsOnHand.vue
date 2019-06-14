<template>
    <div class="playerCardsOnHand field-section" :style="style">
        <div
            v-for="{card, index} in visibleCardHoverActivators"
            :key="`hoverActivator-${card.id}`"
            ref="cardHoverActivator"
            :data-index="index"
            :style="getCardHoverActivatorStyle(card, index)"
            class="cardHoverActivator cardOnHand"
            @click.stop="playerCardClick(card)"
            @mouseenter="mouseEnterCardAtIndex(index)"
            @mouseleave="mouseLeaveCardAtIndex(index)"
        />
        <div
            v-for="{card, index} in visibleCardBlowUps"
            :key="`blowUp-${card.id}`"
            ref="cardHoverBlowUp"
            :data-index="index"
            :style="getCardHoverBlowUpStyle(card, index)"
            class="cardHoverBlowUp"
            @click.stop="playerCardClick(card)"
            @mouseenter="mouseEnterCardAtIndex(index)"
            @mouseleave="mouseLeaveCardAtIndex(index)"
        />
        <div
            v-for="{card, index} in playerVisibleCardsOnHandNotIncludingHoldingCard"
            :key="card.id"
            :class="getPlayerCardClasses(card)"
            :style="getCardOnHandStyle(card, index)"
            @click="switchCardClick(card)"
        />
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const getCardImageUrl = require("../utils/getCardImageUrl.js");
    const matchHelpers = Vuex.createNamespacedHelpers('match');
    const { mapGetters: mapPermissionGetters } = Vuex.createNamespacedHelpers('permission');
    const { mapState: mapCardState } = Vuex.createNamespacedHelpers('card');

    const DragLooseThreshold = 50;

    module.exports = {
        props: ['holdingCard'],
        data() {
            return {
                hoveringOverCardAtIndex: -1,
                draggingCardAtIndex: -1,
                touchStartY: 0,
                startMouseY: null,
                startMouseX: null
            };
        },
        computed: {
            ...matchHelpers.mapState([
                'playerCardsOnHand'
            ]),
            ...matchHelpers.mapGetters([
                'canThePlayer'
            ]),
            ...mapCardState([
                'hiddenCardIdsOnHand',
            ]),
            ...mapPermissionGetters([
                'canMoveCardsFromHand'
            ]),
            style() {
                const style = {};
                if (this.choosingStartingPlayer) {
                    style.zIndex = '9999';
                }
                return style;
            },
            playerVisibleCardsOnHand() {
                return this.playerCardsOnHand.filter(card => !this.hiddenCardIdsOnHand.some(id => id === card.id));
            },
            playerVisibleCardsOnHandNotIncludingHoldingCard() { //TODO Fix naming scheme as "visible" should REALLY mean visible and not what it is now.
                return this.playerVisibleCardsOnHand
                    .map((card, index) => ({ card, index }))
                    .filter(({ card }) => card !== this.holdingCard);
            },
            visibleCardHoverActivators() {
                if (this.holdingCard) return [];

                return this
                    .playerVisibleCardsOnHand
                    .map((card, index) => ({ card, index }))
            },
            visibleCardBlowUps() {
                if (this.holdingCard) return [];

                return this.playerVisibleCardsOnHand
                    .map((card, index) => ({ card, index }))
                    .filter(({ index }) => index === this.hoveringOverCardAtIndex);
            },
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
                const number = startDegrees + degrees;
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
            },
            documentTouchStart(event) {
                this.touchStartY = event.touches[0].clientY;
                this.documentTouchMove(event);
            },
            documentTouchMove(event) {
                if (this.holdingCard) return;

                if (this.hoveringOverCardAtIndex >= 0) {
                    if (event.touches[0].clientY < (this.touchStartY - DragLooseThreshold)) {
                        this.$emit('cardClick', this.playerVisibleCardsOnHand[this.hoveringOverCardAtIndex]);
                        this.hoveringOverCardAtIndex = -1;
                        return;
                    }
                }

                let touchedElement = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);
                const activator = this.$refs.cardHoverActivator.find(activator => activator === touchedElement);
                if (activator) {
                    this.hoveringOverCardAtIndex = parseInt(activator.dataset.index);
                }
                else {
                    this.hoveringOverCardAtIndex = -1;
                }
            },
            documentMouseDown(event) {
                if (!event.target.dataset.index) return;

                this.draggingCardAtIndex = parseInt(event.target.dataset.index);
                this.startMouseY = event.clientY;
                this.startMouseX = event.clientX;
                document.addEventListener('mousemove', this.documentMouseMove);
            },
            documentMouseUp() {
                this.startMouseY = null;
                this.startMouseX = null;
                document.removeEventListener('mousemove', this.documentMouseMove);
            },
            documentMouseMove(event) {
                if (this.startMouseY === null || this.startMouseX === null) return;

                const yPositionAboveThreshold = event.clientY < (this.startMouseY - DragLooseThreshold);
                const xPositionAboveThreshold = event.clientX < (this.startMouseX - DragLooseThreshold) || event.clientX > (this.startMouseX + DragLooseThreshold);
                if (!this.holdingCard && (yPositionAboveThreshold || xPositionAboveThreshold)) {
                    this.$emit('cardDrag', this.playerVisibleCardsOnHand[this.draggingCardAtIndex]);
                    this.hoveringOverCardAtIndex = -1;
                    this.draggingCardAtIndex = -1;
                }
            }
        },
        mounted() {
            document.addEventListener('touchstart', this.documentTouchStart, { passive: false });
            document.addEventListener('touchmove', this.documentTouchMove, { passive: false });

            document.addEventListener('mousedown', this.documentMouseDown);
            document.addEventListener('mouseup', this.documentMouseUp);
        },
        destroyed() {
            document.removeEventListener('touchstart', this.documentTouchStart);
            document.removeEventListener('touchmove', this.documentTouchMove);

            document.removeEventListener('mousedown', this.documentMouseDown);
            document.removeEventListener('mouseup', this.documentMouseUp);
        }
    };
</script>
