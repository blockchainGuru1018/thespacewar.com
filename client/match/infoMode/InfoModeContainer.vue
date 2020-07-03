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
    // TODO: find a way when gameOn to no show the tutorial sugguestion when loading

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
