<template>
    <div class="findCard-wrapper">
        <DimOverlay>
            <template slot="topRightButtons">
                <button
                    v-if="requirementIsCancelable"
                    class="findCard-cancel darkButton--onlyLook"
                    @click="cancelClick"
                >
                    Cancel
                </button>
            </template>
            <template>
                <div class="findCard">
                    <div class="findCard-header">
                        <div class="findCard-requirementCard">
                            <img :src="getCardImageUrl({commonId: requirement.cardCommonId})" />
                        </div>
                        <div class="findCard-headerText">
                            {{ findCardHeaderText }}
                        </div>
                    </div>
                    <div class="findCard-subHeader">
                        <div class="findCard-subHeaderText" v-if="requirement.target === 'hand'">
                            {{ subHeaderText }}
                        </div>
                    </div>
                    <div
                        class="findCard-groups"
                        v-if="requirement"
                    >
                        <div
                            :key="group.source"
                            class="findCard-group"
                            v-for="group in filteredRequirement.cardGroups"
                        >
                            <div class="findCard-groupHeader">
                                {{ getCardGroupTitle(group) }}
                            </div>
                            <div class="findCard-groupCards">
                                <div
                                    :key="card.id"
                                    @click="cardClick(card, group)"
                                    class="findCard-card"
                                    v-for="card in group.cards"
                                >
                                    <img :src="getCardImageUrl(card)" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        class="findCard-doneWrapper"
                        v-if="cardsAvailableToSelect === 0"
                    >
                        <button
                            @click="doneClick"
                            class="findCard-done darkButton"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </template>
        </DimOverlay>
    </div>
</template>
<script>
    import featureToggles from "../../utils/featureToggles.js";

    const Vuex = require('vuex');
    const getCardImageUrl = require('../../utils/getCardImageUrl');
    const findCardHelpers = Vuex.createNamespacedHelpers('findCard');
    const matchHelpers = Vuex.createNamespacedHelpers('match');
    const resolveModuleWithPossibleDefault = require('../../utils/resolveModuleWithPossibleDefault.js');
    const DimOverlay = resolveModuleWithPossibleDefault(require('../overlay/DimOverlay.vue'));
    const Sabotage = require('../../../shared/card/Sabotage.js');
    const MissilesLaunched = require('../../../shared/card/MissilesLaunched.js');
    const requirementHelpers = Vuex.createNamespacedHelpers('requirement');

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
            ...matchHelpers.mapGetters([
                'actionPoints2'
            ]),
            ...requirementHelpers.mapGetters([
                'requirementIsCancelable'
            ]),
            cardsToSelect() {
                return this.requirement.count - this.selectedCardInfos.length;
            },
            cardsAvailableToSelect() {
                return this.filteredRequirement.cardGroups.reduce((acc, group) => acc + group.cards.length, 0);
            },
            findCardHeaderText() {
                let endText = '';

                const cardCommonId = this.requirement.cardCommonId;
                if (cardCommonId === Sabotage.CommonId) {
                    endText = ' to discard';
                }
                else if (cardCommonId === MissilesLaunched.CommonId) {
                    endText = ' to play';
                }

                return `Pick ${this.cardsToSelect} ${pluralize('card', this.cardsToSelect)}${endText}`;
            },
            subHeaderText() {
                const actionPoints = this.actionPoints2;
                return `${actionPoints} action ${pluralize('point', actionPoints)} remaining`;
            }
        },
        methods: {
            ...findCardHelpers.mapActions([
                'selectCard',
                'done'
            ]),
            ...requirementHelpers.mapActions([
                'cancelRequirement'
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
            cancelClick() {
                this.cancelRequirement();
            },
            getCardGroupTitle(group) {
                return nameBySource[group.source];
            }
        },
        components: {
            DimOverlay
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
