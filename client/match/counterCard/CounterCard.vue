<template>
    <div class="counterCard-wrapper">
        <DimOverlay>
            <div class="counterCard">
                <div class="counterCard-header">
                    <div class="counterCard-requirementCard">
                        <img :src="getCardImageUrl({commonId: requirement.cardCommonId})" />
                    </div>
                    <div class="counterCard-headerText">
                        {{ cards.length > 0 ? 'Select card to counter' : 'No card to counter' }}
                    </div>
                </div>
                <div
                    class="counterCard-groups"
                    v-if="cards.length > 0"
                >
                    <div class="counterCard-group">
                        <div class="counterCard-groupCards">
                            <div
                                :key="card.id"
                                @click="cardClick(card)"
                                class="counterCard-card"
                                v-for="card in cards"
                            >
                                <img :src="getCardImageUrl(card)">
                            </div>
                        </div>
                    </div>
                    <div class="counterCard-group counterCard-group--centered">
                        <button
                            @click="cancelClick"
                            class="counterCard-cancel darkButton"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
                <div class="counterCard-cancelWrapper" v-if="cards.length === 0">
                    <button
                        @click="cancelClick"
                        class="counterCard-cancel darkButton"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </DimOverlay>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const getCardImageUrl = require('../../utils/getCardImageUrl');
    const resolveModuleWithPossibleDefault = require('../../utils/resolveModuleWithPossibleDefault.js');
    const DimOverlay = resolveModuleWithPossibleDefault(require('../overlay/DimOverlay.vue'));
    const counterCardHelpers = Vuex.createNamespacedHelpers('counterCard');

    module.exports = {
        computed: {
            ...counterCardHelpers.mapGetters([
                'requirement',
                'cards'
            ])
        },
        methods: {
            ...counterCardHelpers.mapActions([
                'selectCard',
                'cancel'
            ]),
            getCardImageUrl(card) {
                return getCardImageUrl.byCommonId(card.commonId);
            },
            cardClick(card) {
                this.selectCard(card)
            },
            cancelClick() {
                this.$emit('cancel');
                this.cancel();
            }
        },
        components: {
            DimOverlay
        }
    };
</script>
<style lang="scss">
    @import "counterCard";
</style>
