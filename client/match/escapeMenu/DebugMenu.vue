<template>
    <div
        v-if="visible"
        class="debugMenu"
    >
        <button
            class="escapeMenu-option"
            @click="showLog"
        >
            Master log
        </button>
        <button
            class="escapeMenu-option"
            @click="showCheatOptions"
        >
            Cheats
        </button>
        <button
            v-if="audioMuted"
            class="escapeMenu-option"
            @click="unmuteAudio"
        >
            Un-mute audio
        </button>
        <button
            v-else
            class="escapeMenu-option"
            @click="muteAudio"
        >
            Mute audio
        </button>
        <button
            class="escapeMenu-option"
            @click="saveMatch"
        >
            Save state
        </button>
        <button
            class="escapeMenu-option"
            @click="restoreSavedMatch"
        >
            Restored saved match
        </button>
        <button
            class="escapeMenu-option"
            @click="showMainMenu"
        >
            Back
        </button>
        <button class="escapeMenu-option" />
        <button class="escapeMenu-option" />
        <button class="escapeMenu-option" />
        <button class="escapeMenu-option" />
        <button
            class="escapeMenu-danger escapeMenu-option"
            @click="_danger_restart_danger_"
        >
            R E S T A R T
        </button>
    </div>
</template>
<script>
    import Vuex from "vuex";
    import {ViewNames} from "./views.js";
    import localGameDataFacade from "../../utils/localGameDataFacade.js";
    import ajax from "../../utils/ajax.js";

    const escapeMenuHelpers = Vuex.createNamespacedHelpers('escapeMenu');
    const debugHelpers = Vuex.createNamespacedHelpers('debug');

    module.exports = {
        data() {
            return {
                audioMuted: window.audioMuted
            }
        },
        computed: {
            ...escapeMenuHelpers.mapState([
                'view'
            ]),
            visible() {
                return this.view === ViewNames.debug;
            }
        },
        methods: {
            ...escapeMenuHelpers.mapActions([
                'selectView'
            ]),
            ...debugHelpers.mapActions([
                'saveMatch',
                'restoreSavedMatch'
            ]),
            showLog() {
                this.selectView(ViewNames.log);
            },
            showCheatOptions() {
                this.selectView(ViewNames.cheat);
            },
            showMainMenu() {
                this.selectView(ViewNames.main);
            },
            unmuteAudio() {
                window.unmute();
                this.audioMuted = false;
            },
            muteAudio() {
                window.mute();
                this.audioMuted = true;
            },
            async _danger_restart_danger_() {
                const confirmed = confirm('WARNING!   REALLY RESTART?   THIS IS DANGEROUS.');
                if (confirmed) {
                    const superConfirmed = confirm('REALLY REALLY SURE?');
                    if (superConfirmed) {
                        const response = await ajax.jsonPost('/restart', { password: localGameDataFacade.DebugPassword.get() });
                        if (response) {
                            alert(`Response from server: ${response.text}`);
                        }
                    }
                }
            }
        }
    }
</script>
