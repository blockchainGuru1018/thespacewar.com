<template>
    <div class="infoMode-step">
        <h2>Discard phase</h2>
        <p>
            If you have more cards than your maximum hand size you will have to discard enough cards from your hand to
            proceed to the next phase.
        </p>
        <div class="infoMode-spacer--small" />
        <p id="infoMode-handSizeRow">
            This row in your station determines how many cards you're allowed to have on your hand when you enter the
            discard phase.
        </p>
    </div>
</template>
<script>
    import LinesMixin from "../LinesMixin.js";

    export default {
        name: 'DiscardPhase',
        mixins: [LinesMixin([
            ['#infoMode-handSizeRow', '.playerStation-handSizeRow']
        ])]
    }
</script>
