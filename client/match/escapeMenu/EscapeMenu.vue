<template>
    <div
        v-if="visible"
        class="escapeMenu-wrapper"
    >
        <div
            class="escapeMenu-overlay"
            @click.self="hide"
        />
        <div
            v-if="view === 'main'"
            class="escapeMenu"
        >
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
                v-if="validatedDebug"
                class="escapeMenu-fadedOption escapeMenu-option"
                @click="showDebugOptions"
            >
                Debug options
            </button>
        </div>

        <div
            v-else-if="view === 'debug'"
            class="debugMenu escapeMenu"
        >
            <button
                @click="showLog"
                class="escapeMenu-option"
            >
                Master log
            </button>
            <button
                @click="showCheatOptions"
                class="escapeMenu-option"
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
                @click="view = 'main'"
            >
                Back
            </button>
        </div>

        <div
            v-else-if="view === 'cheat'"
            class="cheatMenu escapeMenu"
        >
            <div
                class="escapeMenu-option"
            >
                <label>
                    <span>
                        Type*
                    </span>
                    <select v-model="cheatType">
                        <option
                            v-for="option in cheatTypeOptions"
                            :key="option.value"
                            :value="option.value"
                        >
                            {{ option.text }}
                        </option>
                    </select>
                </label>
            </div>
            <div
                class="escapeMenu-option"
            >
                <label>
                    <span>
                        Count*
                    </span>
                    <input v-model.number="cheatCount" type="number" />
                </label>
            </div>
            <div
                class="escapeMenu-option"
            >
                <label>
                    <span>
                        Card ID
                    </span>
                    <input v-model="cheatCommonId" type="text" value="0" />
                </label>
            </div>
            <button
                class="escapeMenu-option"
                @click="sendCheat"
            >
                Send
            </button>
            <button
                class="escapeMenu-option"
                @click="view = 'debug'"
            >
                Back
            </button>
        </div>

        <div
            v-else-if="view === 'log'"
            class="logMenu escapeMenu"
        >
            <div class="escapeMenu-logOption escapeMenu-option">
                <pre>
                    {{ log }}
                </pre>
            </div>
            <button
                class="escapeMenu-option"
                @click="view = 'debug'"
            >
                Back
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
    const localGameDataFacade = require('../../utils/localGameDataFacade.js');
    const ajax = require('../../utils/ajax.js');

    module.exports = {
        data() {
            return {
                view: 'main', //main, debug, cheat, log
                audioMuted: window.audioMuted,
                cheatType: 'addCard',
                cheatCount: 1,
                cheatCommonId: '',
                log: '',
                validatedDebug: false
            };
        },
        computed: {
            ...escapeMenuHelpers.mapState([
                'visible'
            ]),
            ...matchHelpers.mapState([
                'aiStarted'
            ]),
            cheatTypeOptions() {
                return [
                    { value: 'addCard', text: 'Add card' },
                    { value: 'actionPoints', text: 'Add action points' },
                    { value: 'removeAllRequirements', text: 'Remove all requirements' },
                    { value: 'getCardsInDeck', text: 'Get cards in deck (result is logged in the console)' }
                ];
            }
        },
        watch: {
            visible() {
                this.view = 'main';

                if (this.visible) {
                    this.validateDebug();
                }
            }
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
            },
            showDebugOptions() {
                this.view = 'debug';
            },
            showCheatOptions() {
                this.view = 'cheat';
            },
            sendCheat() {
                window.cheat(this.cheatType, {
                    count: this.cheatCount,
                    commonId: this.cheatCommonId
                });
            },
            async showLog() {
                this.view = 'log';
                this.log = 'LOADING LOG';
                this.log = await ajax.getText('/master-log', { password: localGameDataFacade.DebugPassword.get() });
            },
            unmuteAudio() {
                window.unmute();
                this.audioMuted = false;
            },
            muteAudio() {
                window.mute();
                this.audioMuted = true;
            },
            async validateDebug() {
                const { valid } = await ajax.jsonPost('/test-debug', { password: localGameDataFacade.DebugPassword.get() });
                if (valid) {
                    this.validatedDebug = true;
                }
            }
        },
        components: {
            MasterGainSlider
        }
    };
</script>
<style lang="scss">
    @import "escapeMenu";
    @import "debugMenu";
</style>
