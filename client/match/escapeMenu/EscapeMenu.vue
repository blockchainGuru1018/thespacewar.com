<template>
    <div
        v-if="visible"
        class="escapeMenu-wrapper"
    >
        <div
            class="escapeMenu-overlay"
            @click.self="hide"
        />
        <component
            :is="currentMenuView"
            class="escapeMenu"
        />
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

    module.exports = {
        computed: {
            ...escapeMenuHelpers.mapState([
                'view',
                'visible'
            ]),
            currentMenuView() {
                return {
                    main: MainMenu,
                    debug: DebugMenu,
                    cheat: CheatMenu,
                    log: LogMenuShell,
                }[this.view];
            }
        },
        watch: {
            async visible() {
                this.selectView('main');

                if (this.visible) {
                    await this.validateDebug();
                }
            }
        },
        methods: {
            ...escapeMenuHelpers.mapActions([
                'hide',
                'validateDebug',
                'selectView',
            ]),
            showDebugOptions() {
                this.selectView('debug');
            },
            showCheatOptions() {
                this.selectView('cheat');
            },
            showMainMenu() {
                this.selectView('main');
            },
            async showLog() {
                this.selectView('log');
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
