<template>
    <ToggleInfoModeButton
        @toggleInfoMode="toggle"
    />
</template>
<script>
    import ToggleInfoModeButton from "./ToggleInfoModeButton.vue";
    import Vuex from 'vuex';

    const infoModeHelpers = Vuex.createNamespacedHelpers('infoMode');

    export default {
        components: { ToggleInfoModeButton },
        methods: {
            ...infoModeHelpers.mapActions(['toggle'])
        }
    }
</script>
