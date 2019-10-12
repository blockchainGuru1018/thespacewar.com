<template>
    <div>
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
    const Vuex = require('vuex');
    const escapeMenuHelpers = Vuex.createNamespacedHelpers('escapeMenu');
    const localGameDataFacade = require('../../utils/localGameDataFacade.js');
    const ajax = require('../../utils/ajax.js');

    module.exports = {
        props: ['view'],
        data() {
            return {
                audioMuted: window.audioMuted
            }
        },
        methods: {
            ...escapeMenuHelpers.mapActions([
                'selectView'
            ]),
            showLog() {
                this.selectView('log');
            },
            showCheatOptions() {
                this.$emit('showCheatOptions');
            },
            showMainMenu() {
                this.$emit('showMainMenu');
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
