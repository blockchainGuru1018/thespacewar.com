<template>
    <div class="counterAttack-wrapper">
        <div class="dimOverlay"/>
        <div class="counterAttack">
            <div class="counterAttack-header">
                <div class="counterAttack-requirementCard">
                    <img :src="getCardImageUrl({commonId: requirement.cardCommonId})"/>
                </div>
                <div class="counterAttack-headerText">
                    {{ attacks.length > 0 ? 'Select attack to counter' : 'No attack to counter' }}
                </div>
            </div>
            <template v-if="attacks.length > 0">
                <div class="counterAttack-attacks">
                    <div
                        v-for="attack in attacks"
                        :key="attack.time"
                        class="counterAttack-attack"
                        @click="attackClick(attack)"
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
                                v-for="defenderCardData in attack.defenderCardsData"
                                :key="defenderCardData.id"
                                :src="getCardImageUrl(defenderCardData)"
                                class="counterAttack-card"
                            >
                        </div>
                    </div>
                </div>
                <div class="counterAttack-cancelWrapper">
                    <button
                        class="counterAttack-cancel darkButton"
                        @click="cancelClick"
                    >
                        Cancel
                    </button>
                </div>
            </template>
            <div v-else class="counterAttack-cancelAloneWrapper">
                <button
                    class="counterAttack-cancel darkButton"
                    @click="cancelClick"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const getCardImageUrl = require('../../utils/getCardImageUrl');
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
        }
    };
</script>
<style lang="scss">
    @import "counterAttack";
</style>
