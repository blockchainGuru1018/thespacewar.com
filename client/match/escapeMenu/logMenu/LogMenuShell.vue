<template>
    <LogMenu v-if="visible" />
</template>

<script>
    import Vuex from 'vuex';
    import LogMenu from './LogMenu.vue';

    const escapeMenuHelpers = Vuex.createNamespacedHelpers('escapeMenu');

    export default {
        computed: {
            ...escapeMenuHelpers.mapState([
                'view'
            ]),
            visible() {
                return this.view === 'log';
            }
        },
        components: {
            LogMenu
        }
    }
</script>
