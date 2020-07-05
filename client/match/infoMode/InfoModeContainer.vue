<template>
    <portal
        v-if="visible || shouldDisplayTutorialSuggestion"
        to="match"
    >
        <InfoMode
            :showTutorialSuggestion="shouldDisplayTutorialSuggestion"
            @hide="hide"
        />
    </portal>
</template>
<script>

    import InfoMode from "./InfoMode.vue";
    import Vuex from 'vuex';

    const infoModeHelpers = Vuex.createNamespacedHelpers('infoMode');

    export default {
        components: {InfoMode},
        computed: {
            ...infoModeHelpers.mapState([
                'visible',
                'showTutorialSuggestion'
            ]),
            ...infoModeHelpers.mapGetters([
                'shouldDisplayTutorialSuggestion',
            ])
        },
        methods: {
            ...infoModeHelpers.mapActions([
                'hide'
            ])
        }
    }
</script>
