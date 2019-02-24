<template>
    <div class="cardChoiceDialog-wrapper">
        <portal to="match">
            <div @click.self="choiceDialogCancel" class="cardChoiceDialog-overlay" v-if="dialogVisible"/>
            <div v-if="dialogVisible" class="cardChoiceDialog">
                <button v-for="choice in choices"
                        class="cardChoiceDialog-choice"
                        @click="choiceDialogApplyChoice(choice.name)">
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
        padding: 20px 0;
        justify-content: center;
        align-items: stretch;
        background: linear-gradient(to top, rgba(24, 24, 24, 0.8), rgba(47, 47, 47, 0.6));
        color: rgba(255, 255, 255, .9);
    }

    .cardChoiceDialog-choice {
        color: #FAFAFA;
        border: none;
        font-size: 20px;
        padding: 18px 120px;
        background: transparent;
        font-weight: bold;
        margin-bottom: 6px;
        font-family: "Space Mono", monospace;
        letter-spacing: .18em;

        &:hover {
            background-color: rgba(255, 255, 255, .1);
        }

        &:last-child {
            margin-bottom: 0;
        }
    }
</style>