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
            class="escapeMenu"
            :validatedDebug="validatedDebug"
            @showDebugOptions="showDebugOptions"
        />
        <DebugMenu
            v-if="view === 'debug'"
            class="debugMenu escapeMenu"
            :view="view"
            @showLog="showLog"
            @showCheatOptions="showCheatOptions"
            @showMainMenu="showMainMenu"
        />
        <CheatMenu
            v-else-if="view === 'cheat'"
            class="escapeMenu"
            @showDebugOptions="showDebugOptions"
        />
        <LogMenuShell class="escapeMenu" />
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const escapeMenuHelpers = Vuex.createNamespacedHelpers('escapeMenu');
    const resolveModule = require('../../utils/resolveModuleWithPossibleDefault.js');
    const MainMenu = resolveModule(require('./MainMenu.vue'));
    const DebugMenu = resolveModule(require('./DebugMenu.vue'));
    const CheatMenu = resolveModule(require('./CheatMenu.vue'));
    const LogMenuShell = resolveModule(require('./logMenu/LogMenuShell.vue'));
    const MasterGainSlider = require('../../audio/MasterGainSlider.vue');
    const localGameDataFacade = require('../../utils/localGameDataFacade.js');
    const ajax = require('../../utils/ajax.js');

    module.exports = {
        data() {
            return {
                view: 'main', //main, debug, cheat, log
                validatedDebug: false
            };
        },
        computed: {
            ...escapeMenuHelpers.mapState([
                'visible'
            ])
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
            async showLog() {
                this.view = 'log';
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
            DebugMenu,
            CheatMenu,
            LogMenuShell
        }
    };
</script>
<style lang="scss" src="./_escapeMenu.scss" />
