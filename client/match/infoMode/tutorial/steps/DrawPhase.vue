<template>
    <div class="infoMode-step">
        <h2>Draw phase</h2>
        <p>
            You have to draw a certain amount of cards to proceed to the next phase.
        </p>
        <p id="infoMode-drawRow">
            This row in your station determines how many cards you draw in the draw phase.
        </p>
        <p>
            When you have no more cards left in your deck you will take damage to
            your station instead of drawing cards.
        </p>
    </div>
</template>
<script>
    import LinesMixin from "../LinesMixin.js";

    export default {
        name: 'DrawPhase',
        mixins: [LinesMixin([
            ['#infoMode-drawRow', '.playerStation-drawRow']
        ])]
    }
</script>
