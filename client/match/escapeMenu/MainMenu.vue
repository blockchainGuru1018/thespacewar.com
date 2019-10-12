<template>
    <div v-if="visible">
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
            v-if="validatedDebug"
            class="escapeMenu-fadedOption escapeMenu-option"
            @click="showDebugOptions"
        >
            Debug options
        </button>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const escapeMenuHelpers = Vuex.createNamespacedHelpers('escapeMenu');
    const matchHelpers = Vuex.createNamespacedHelpers('match');
    const resolveModule = require('../../utils/resolveModuleWithPossibleDefault.js');
    const MasterGainSlider = resolveModule(require('../../audio/MasterGainSlider.vue'));

    module.exports = {
        name: 'MainMenu',
        computed: {
            ...escapeMenuHelpers.mapState([
                'view',
                'validatedDebug'
            ]),
            ...matchHelpers.mapState([
                'aiStarted'
            ]),
            visible() {
                return this.view === 'main';
            }
        },
        methods: {
            ...escapeMenuHelpers.mapActions([
                'hide',
                'selectView'
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
            },
            showDebugOptions() {
                this.selectView('debug');
            }
        },
        components: {
            MasterGainSlider
        }
    }
</script>
