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
<style scoped lang="scss">

    .cardChoiceDialog-overlay {
        background-color: rgba(0, 0, 0, .3);
        position: absolute;
        z-index: 1000;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
    }

    .cardChoiceDialog {
        position: absolute;
        z-index: 1001;
        transform: translate(-50%, -50%);
        top: 50%;
        left: 50%;
        display: flex;
        flex-direction: column;
        border-radius: 4px;
        padding: 20px 0;
        justify-content: center;
        align-items: stretch;
        background: linear-gradient(to bottom, rgba(10, 10, 20, 1), rgba(20, 10, 10, 1))
    }

    .cardChoiceDialog-choice {
        color: #FFF;
        border: none;
        font-size: 20px;
        padding: 18px 120px;
        background: transparent;
        font-weight: bold;
        margin-bottom: 6px;
        font-family: "Space Mono", monospace;
        letter-spacing: .18em;

        &:hover {
            background-color: rgba(120, 120, 120, .06);
        }

        &:last-child {
            margin-bottom: 0;
        }
    }
</style>