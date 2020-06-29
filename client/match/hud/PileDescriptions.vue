<template>
    <div>
        <portal to="playerDrawPile">
            <span
                v-if="canDrawCards"
                class="playerDrawPileDescription descriptionText"
            >
                Click to draw
            </span>
        </portal>
        <portal to="opponentDrawPile">
            <span
                v-if="canMill"
                class="opponentDrawPileDescription descriptionText"
            >
                {{ millText }}
            </span>
        </portal>
    </div>
</template>

<script>
    import Vuex from 'vuex';

    const matchHelpers = Vuex.createNamespacedHelpers('match');
    const permissionHelpers = Vuex.createNamespacedHelpers('permission');

    export default {
        name: 'PileDescriptions',
        computed: {
            ...matchHelpers.mapGetters([
                'gameConfig',
            ]),
            ...permissionHelpers.mapGetters([
                'canDrawCards',
                'canMill',
            ]),
            millText() {
                return `Click to mill ${pluralize('card', this.millCardCount)}`;
            },
            millCardCount() {
                return this.gameConfig.millCardCount();
            },
        }
    }

    function pluralize(word, count) {
        return count === 1 ? word : word + 's';
    }
</script>

<style lang="scss">
    @import "guiDescription";
</style>
