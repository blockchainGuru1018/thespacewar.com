<template>
    <div class="cardChoiceDialog-wrapper">
        <portal to="match">
            <div
                v-if="dialogVisible"
                class="cardChoiceDialog-overlay"
                @click.self="choiceDialogCancel"
            />
            <div
                v-if="dialogVisible"
                class="cardChoiceDialog"
            >
                <button
                    v-for="choice in choices"
                    :key="choice.name"
                    class="cardChoiceDialog-choice"
                    @click="choiceDialogApplyChoice(choice.name)"
                >
                    {{ choice.text }}
                </button>
            </div>
        </portal>
    </div>
</template>
<script>
    const Vuex = require('vuex');

    const {
        mapState: mapCardState,
        mapGetters: mapCardGetters,
        mapActions: mapCardActions
    } = Vuex.createNamespacedHelpers('card');
    const {
        mapGetters: mapMatchGetters
    } = Vuex.createNamespacedHelpers('match');

    module.exports = {
        computed: {
            ...mapCardState([
                'choiceCardId'
            ]),
            ...mapCardGetters([
                'choices'
            ]),
            ...mapMatchGetters([
                'createCard'
            ]),
            dialogVisible() {
                return this.choices.length > 0;
            }
        },
        methods: {
            ...mapCardActions([
                'choiceDialogCancel',
                'choiceDialogApplyChoice'
            ]),
        }
    };
</script>
