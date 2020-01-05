<template>
    <portal
        v-if="visible"
        to="match"
    >
        <InfoMode @hide="hide" />
    </portal>
</template>
<script>
    import InfoMode from "./InfoMode.vue";
    import Vuex from 'vuex';

    const infoModeHelpers = Vuex.createNamespacedHelpers('infoMode');

    export default {
        components: { InfoMode },
        computed: {
            ...infoModeHelpers.mapState([
                'visible'
            ])
        },
        methods: {
            ...infoModeHelpers.mapActions([
                'hide'
            ])
        }
    }
</script>
