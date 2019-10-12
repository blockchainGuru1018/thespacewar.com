<template>
    <div
        v-if="visible"
        class="logMenu"
    >
        <div class="escapeMenu-logOption escapeMenu-option">
            <pre>
                {{ log }}
            </pre>
        </div>
        <button
            class="escapeMenu-option"
            @click="showDebugOptions"
        >
            Back
        </button>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const escapeMenuHelpers = Vuex.createNamespacedHelpers('escapeMenu');
    const localGameDataFacade = require('../../utils/localGameDataFacade.js');
    const ajax = require('../../utils/ajax.js');

    module.exports = {
        data() {
            return {
                log: ''
            };
        },
        watch: {
            visible: {
                immediate: true,
                async handler() {
                    this.log = 'LOADING LOG';
                    const { text } = await ajax.jsonPost('/master-log', { password: localGameDataFacade.DebugPassword.get() });
                    this.log = text;
                }
            }
        },
        computed: {
            visible() {
                return this.view === 'log';
            },
            ...escapeMenuHelpers.mapState([
                'view'
            ]),
        },
        methods: {
            ...escapeMenuHelpers.mapActions([
                'selectView'
            ]),
            showDebugOptions() {
                this.selectView('debug');
            }
        }
    };
</script>
