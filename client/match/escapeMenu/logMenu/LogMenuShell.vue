<template>
    <LogMenu v-if="visible" />
</template>

<script>
    import Vuex from 'vuex';
    import LogMenu from './LogMenu.vue';
    import {ViewNames} from "../views.js";

    const escapeMenuHelpers = Vuex.createNamespacedHelpers('escapeMenu');

    export default {
        components: {
            LogMenu
        },
        computed: {
            ...escapeMenuHelpers.mapState([
                'view'
            ]),
            visible() {
                return this.view === ViewNames.log;
            }
        }
    }
</script>
