<template>
    <div
        v-if="visible"
        class="escapeMenu-wrapper"
    >
        <div
            class="escapeMenu-overlay"
            @click.self="hide"
        />
        <MainMenu
            v-if="view === 'main'"
            class="escapeMenu"
            :validatedDebug="validatedDebug"
            @showDebugOptions="showDebugOptions"
        />
        <DebugMenu
            v-else-if="view === 'debug'"
            class="debugMenu escapeMenu"
            :view="view"
            @showLog="showLog"
            @showCheatOptions="showCheatOptions"
            @showMainMenu="showMainMenu"
        />
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
                    <input
                        v-model.number="cheatCount"
                        type="number"
                    >
                </label>
            </div>
            <div
                class="escapeMenu-option"
            >
                <label>
                    <span>
                        Card ID
                    </span>
                    <select v-model="cheatCommonId">
                        <option
                            v-for="option in cardOptions"
                            :key="option.value"
                            :value="option.value"
                        >
                            {{ option.text }}
                        </option>
                    </select>
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
    const MainMenu = resolveModule(require('./MainMenu.vue'));
    const DebugMenu = resolveModule(require('./DebugMenu.vue'));
    const MasterGainSlider = resolveModule(require('../../audio/MasterGainSlider.vue'));
    const localGameDataFacade = require('../../utils/localGameDataFacade.js');
    const ajax = require('../../utils/ajax.js');

    module.exports = {
        data() {
            return {
                view: 'main', //main, debug, cheat, log
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
            ...matchHelpers.mapGetters([
                'cardDataAssembler'
            ]),
            cheatTypeOptions() {
                return [
                    { value: 'addCard', text: 'Add card' },
                    { value: 'actionPoints', text: 'Add action points' },
                    { value: 'removeAllRequirements', text: 'Remove all requirements' },
                    { value: 'addDamageStationCardRequirement', text: 'Add damage station card requirement' },
                    { value: 'getCardsInDeck', text: 'Get cards in deck (result is logged in the console)' }
                ];
            },
            cardOptions() {
                const allCards = this.cardDataAssembler.createOneOfEach();
                return allCards.map(cardData => {
                    return { value: cardData.commonId, text: cardData.name };
                });
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
            showDebugOptions() {
                this.view = 'debug';
            },
            showCheatOptions() {
                this.view = 'cheat';
            },
            showMainMenu() {
                this.view = 'main';
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
                const { text } = await ajax.jsonPost('/master-log', { password: localGameDataFacade.DebugPassword.get() });
                this.log = text;
            },
            async validateDebug() {
                const { valid } = await ajax.jsonPost('/test-debug', { password: localGameDataFacade.DebugPassword.get() });
                if (valid) {
                    this.validatedDebug = true;
                }
            }
        },
        components: {
            MasterGainSlider,
            MainMenu,
            DebugMenu
        }
    };
</script>
<style lang="scss" src="./_escapeMenu.scss" />
