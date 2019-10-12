<template>
    <div
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
    const localGameDataFacade = require('../../utils/localGameDataFacade.js');
    const ajax = require('../../utils/ajax.js');

    module.exports = {
        data() {
            return {
                log: ''
            };
        },
        async mounted() {
            this.log = 'LOADING LOG';
            const { text } = await ajax.jsonPost('/master-log', { password: localGameDataFacade.DebugPassword.get() });
            this.log = text;
        },
        methods: {
            showDebugOptions() {
                this.$emit('showDebugOptions');
            }
        }
    };
</script>
