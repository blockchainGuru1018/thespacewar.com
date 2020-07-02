<template>
    <div class="counterAttack-wrapper">
        <DimOverlay>
            <div class="counterAttack">
                <div class="counterAttack-header">
                    <div class="counterAttack-requirementCard">
                        <img :src="getCardImageUrl({commonId: requirement.cardCommonId})" />
                    </div>
                    <div class="counterAttack-headerText">
                        {{ attacks.length > 0 ? 'Select attack to counter' : 'No attack to counter' }}
                    </div>
                </div>
                <template v-if="attacks.length > 0">
                    <div class="counterAttack-attacks">
                        <div
                            :key="attack.time"
                            @click="attackClick(attack)"
                            class="counterAttack-attack"
                            v-for="attack in attacks"
                        >
                            <img
                                :src="getCardImageUrl(attack.attackerCardData)"
                                class="counterAttack-card"
                            >
                            <span>⟶</span>
                            <div
                                :class="['counterAttack-attackDefenderCards', {'counterAttack-attackDefenderCards--many': attack.defenderCardsData.length > 1}]"
                            >
                                <img
                                    :key="defenderCardData.id"
                                    :src="getCardImageUrl(defenderCardData)"
                                    class="counterAttack-card"
                                    v-for="defenderCardData in attack.defenderCardsData"
                                >
                            </div>
                        </div>
                    </div>
                    <div class="counterAttack-cancelWrapper">
                        <button
                            @click="cancelClick"
                            class="counterAttack-cancel darkButton"
                        >
                            Cancel
                        </button>
                    </div>
                </template>
                <div class="counterAttack-cancelAloneWrapper" v-else>
                    <button
                        @click="cancelClick"
                        class="counterAttack-cancel darkButton"
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
    const resolveModuleWithPossibleDefault = require('../../utils/resolveModuleWithPossibleDefault.js');
    const DimOverlay = resolveModuleWithPossibleDefault(require('../overlay/DimOverlay.vue'));
    const getCardImageUrl = require('../../utils/getCardImageUrl.js');
    const counterAttackHelpers = Vuex.createNamespacedHelpers('counterAttack');

    module.exports = {
        computed: {
            ...counterAttackHelpers.mapGetters([
                'requirement',
                'attacks'
            ])
        },
        methods: {
            ...counterAttackHelpers.mapActions([
                'selectAttack',
                'cancel'
            ]),
            getCardImageUrl(cardData) {
                return getCardImageUrl.byCommonId(cardData.commonId);
            },
            attackClick(attack) {
                this.selectAttack(attack)
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
    @import "counterAttack";
</style>
