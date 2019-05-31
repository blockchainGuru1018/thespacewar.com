<template>
    <div
        v-if="visible"
        class="escapeMenu-wrapper"
    >
        <div
            class="escapeMenu-overlay"
            @click.self="hide"
        />
        <div class="escapeMenu">
            <button
                class="escapeMenu-option"
                title="If something appears to be wrong, this might fix it. No data will be lost when you reload the page!"
                @click="hideAnd(reloadPage)"
            >
                Reload page
            </button>
            <button class="escapeMenu-option">
                Sound:
                <MasterGainSlider />
            </button>
            <button
                class="escapeMenu-option"
                @click="hideAnd(saveMatch)"
            >
                Save game
            </button>
            <button
                class="escapeMenu-option"
                @click="hideAnd(restoreSavedMatch)"
            >
                Load game
            </button>
            <button
                class="escapeMenu-retreat escapeMenu-option"
                @click="hideAnd(retreat)"
            >
                Retreat
            </button>
            <button
                v-if="aiStarted"
                class="escapeMenu-option"
                @click="reloadPage"
            >
                Stop AI
            </button>
            <button
                v-else
                class="escapeMenu-startAi escapeMenu-fadedOption escapeMenu-option"
                @click="hideAnd(startAI)"
            >
                Start AI (experimental)
            </button>
            <button
                class="escapeMenu-fadedOption escapeMenu-option"
            >
                Debug options
            </button>
        </div>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const escapeMenuHelpers = Vuex.createNamespacedHelpers('escapeMenu');
    const matchHelpers = Vuex.createNamespacedHelpers('match');
    const resolveModule = require('../../utils/resolveModuleWithPossibleDefault.js');
    const MasterGainSlider = resolveModule(require('../../audio/MasterGainSlider.vue'));

    module.exports = {
        computed: {
            ...escapeMenuHelpers.mapState([
                'visible'
            ]),
            ...matchHelpers.mapState([
                'aiStarted'
            ])
        },
        methods: {
            ...escapeMenuHelpers.mapActions([
                'hide'
            ]),
            ...matchHelpers.mapActions([
                'saveMatch',
                'restoreSavedMatch',
                'retreat',
                'startAI'
            ]),
            hideAnd(method) {
                this.hide();
                method();
            },
            reloadPage() {
                window.location.reload();
            }
        },
        components: {
            MasterGainSlider
        }
    }
</script>
<style lang="scss">
    @import "escapeMenu";
</style>
