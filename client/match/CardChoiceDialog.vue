<template>
    <div class="cardChoiceDialog-wrapper">
        <portal to="match">
            <div v-if="dialogVisible" class="cardChoiceDialog-overlay"/>
            <div v-if="dialogVisible" class="cardChoiceDialog">
                <h1>Choose event effect</h1>
                <button v-for="choice in choices"
                        class="cardChoiceDialog-choice"
                        @click="choiceDialogApplyChoice(choice.name)">
                    {{ choice.text }}
                </button>
                <button class="cardChoiceDialog-choice"
                        @click="choiceDialogCancel">
                    Cancel
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
        mapMutations: mapCardMutations,
        mapActions: mapCardActions
    } = Vuex.createNamespacedHelpers('card');
    const {
        mapState: mapMatchState,
        mapGetters: mapMatchGetters,
        mapMutations: mapMatchMutations,
        mapActions: mapMatchActions
    } = Vuex.createNamespacedHelpers('match');

    module.exports = {
        computed: {
            ...mapCardState([
                'choiceCardId'
            ]),
            ...mapCardGetters([
                'choiceCardData',
            ]),
            ...mapMatchGetters([
                'createCard'
            ]),
            choices() {
                if (!this.choiceCardId) return [];

                const card = this.createCard(this.choiceCardData);
                return card.choicesWhenPutDownInHomeZone;
            },
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
        background-color: rgba(0, 0, 0, .32);
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
        background: #FFF;
        border-radius: 4px;
        padding: 20px;
        justify-content: center;
        align-items: stretch;
    }

    .cardChoiceDialog h1 {
        font-family: Helvetica, sans-serif;
        font-size: 22px;
        font-weight: bold;
        margin-bottom: 25px;
        text-align: center;
    }

    .cardChoiceDialog-choice {
        color: #444;
        border: none;
        font-size: 18px;
        padding: 8px 12px;
        letter-spacing: .11em;
        background: transparent;
        font-weight: bold;
        margin-bottom: 6px;

        &:hover {
            background-color: rgba(0, 0, 0, .1);
        }

        &:last-child {
            margin-bottom: 0;
        }
    }
</style>