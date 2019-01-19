<template>
    <div class="putDownCardChoiceDialog-wrapper">
        <portal to="match">
            <div v-if="dialogVisible" class="putDownCardChoiceDialog-overlay"/>
            <div v-if="dialogVisible" class="putDownCardChoiceDialog">
                <h1>Choose event effect</h1>
                <button v-for="choice in choices"
                        class="putDownCardChoiceDialog-choice"
                        @click="putDownCardWithChoice(choice.name)">
                    {{ choice.text }}
                </button>
                <button class="putDownCardChoiceDialog-choice"
                        @click="hideChoiceDialog">
                    Cancel
                </button>
            </div>
        </portal>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const {
        mapState: mapPutDownCardState,
        mapGetters: mapPutDownCardGetters,
        mapMutations: mapPutDownCardMutations,
        mapActions: mapPutDownCardActions
    } = Vuex.createNamespacedHelpers('putDownCard');
    const {
        mapState: mapMatchState,
        mapGetters: mapMatchGetters,
        mapMutations: mapMatchMutations,
        mapActions: mapMatchActions
    } = Vuex.createNamespacedHelpers('match');

    module.exports = {
        computed: {
            ...mapPutDownCardState([
                'choiceCardId'
            ]),
            ...mapPutDownCardGetters([
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
            ...mapPutDownCardActions([
                'putDownCard',
                'hideChoiceDialog'
            ]),
            putDownCardWithChoice(choice) {
                const cardId = this.choiceCardId;
                this.hideChoiceDialog();
                this.putDownCard({ location: 'zone', cardId, choice });
            }
        }
    };
</script>
<style scoped lang="scss">

    .putDownCardChoiceDialog-overlay {
        background-color: rgba(0, 0, 0, .32);
        position: absolute;
        z-index: 1000;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
    }

    .putDownCardChoiceDialog {
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

    .putDownCardChoiceDialog h1 {
        font-family: Helvetica, sans-serif;
        font-size: 22px;
        font-weight: bold;
        margin-bottom: 25px;
        text-align: center;
    }

    .putDownCardChoiceDialog-choice {
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