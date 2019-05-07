<template>
    <div class="counterCard-wrapper">
        <div class="dimOverlay"/>
        <div class="counterCard">
            <div class="counterCard-header">
                <div class="counterCard-requirementCard">
                    <img :src="getCardImageUrl({commonId: requirement.cardCommonId})"/>
                </div>
                <div class="counterCard-headerText">
                    Select card to counter
                </div>
            </div>
            <div
                v-if="cards.length > 0"
                class="counterCard-groups"
            >
                <div class="counterCard-group">
                    <div class="counterCard-groupCards">
                        <div
                            v-for="card in cards"
                            :key="card.id"
                            class="counterCard-card"
                            @click="cardClick(card)"
                        >
                            <img :src="getCardImageUrl(card)">
                        </div>
                    </div>
                </div>
                <div class="counterCard-group counterCard-group--centered">
                    <button
                        class="counterCard-cancel darkButton"
                        @click="cancelClick"
                    >
                        Cancel
                    </button>
                </div>
            </div>
            <div v-if="cards.length === 0" class="counterCard-cancelWrapper">
                <button
                    class="counterCard-cancel darkButton"
                    @click="cancelClick"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const getCardImageUrl = require('../../utils/getCardImageUrl');
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
        }
    };
</script>
<style lang="scss">
    @import "counterCard";
</style>
