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
    import views from './views.js';

    const Vuex = require('vuex');
    const escapeMenuHelpers = Vuex.createNamespacedHelpers('escapeMenu');
    const MasterGainSlider = require('../../audio/MasterGainSlider.vue');

    module.exports = {
        computed: {
            ...escapeMenuHelpers.mapState([
                'view',
                'visible'
            ]),
            currentMenuView() {
                return views[this.view];
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
        }
    };
</script>
<style lang="scss" src="./_escapeMenu.scss" />
