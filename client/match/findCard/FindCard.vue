<template>
    <div class="findCard-wrapper">
        <div class="dimOverlay" />
        <div class="findCard">
            <div class="findCard-header">
                <div class="findCard-requirementCard">
                    <img :src="getCardImageUrl({commonId: requirement.cardCommonId})" />
                </div>
                <div class="findCard-headerText">
                    {{ findCardHeaderText }}
                </div>
            </div>
            <div
                v-if="requirement"
                class="findCard-groups"
            >
                <div
                    v-for="group in filteredRequirement.cardGroups"
                    :key="group.source"
                    class="findCard-group"
                >
                    <div class="findCard-groupHeader">
                        {{ getCardGroupTitle(group) }}
                    </div>
                    <div class="findCard-groupCards">
                        <div
                            v-for="card in group.cards"
                            :key="card.id"
                            class="findCard-card"
                            @click="cardClick(card, group)"
                        >
                            <img :src="getCardImageUrl(card)" />
                        </div>
                    </div>
                </div>
            </div>
            <div
                v-if="cardsAvailableToSelect === 0"
                class="findCard-doneWrapper"
            >
                <button
                    class="findCard-done darkButton"
                    @click="doneClick"
                >
                    Done
                </button>
            </div>
        </div>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const getCardImageUrl = require('../../utils/getCardImageUrl');
    const findCardHelpers = Vuex.createNamespacedHelpers('findCard');

    const nameBySource = { //TODO Do something clever with a the, future, new Source classes
        'deck': 'Deck',
        'discardPile': 'Discard pile',
        'drawStationCards': 'Station cards (draw)',
        'actionStationCards': 'Station cards (action points)',
        'handSizeStationCards': 'Station cards (max cards)',
        'opponentDrawStationCards': 'Opponent station cards (draw)',
        'opponentActionStationCards': 'Opponent station cards (action points)',
        'opponentHandSizeStationCards': 'Opponent station cards (max cards)',
        'opponentHand': 'Opponent cards on hand'
    };

    module.exports = {
        computed: {
            ...findCardHelpers.mapState([
                'selectedCardInfos'
            ]),
            ...findCardHelpers.mapGetters([
                'requirement',
                'filteredRequirement'
            ]),
            cardsToSelect() {
                return this.requirement.count - this.selectedCardInfos.length;
            },
            cardsAvailableToSelect() {
                return this.filteredRequirement.cardGroups.reduce((acc, group) => acc + group.cards.length, 0);
            },
            findCardHeaderText() {
                return `Pick ${this.cardsToSelect} ${pluralize('card', this.cardsToSelect)}`;
            }
        },
        methods: {
            ...findCardHelpers.mapActions([
                'selectCard',
                'done'
            ]),
            getCardImageUrl(card) {
                return getCardImageUrl.byCommonId(card.commonId);
            },
            cardClick(card, group) {
                this.selectCard({ id: card.id, source: group.source })
            },
            doneClick() {
                this.done();
            },
            getCardGroupTitle(group) {
                return nameBySource[group.source];
            }
        }
    };

    function pluralize(word, count) {
        return count === 1 ? word : word + 's';
    }

</script>
<style lang="scss">
    @import "../enlargeCard";
    @import "../findCard";
</style>
