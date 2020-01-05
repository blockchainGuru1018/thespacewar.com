<template>
    <div class="infoMode-step">
        <h2>Action phase</h2>
        <p>
            You can play any card from your hand or any flipped station card. You can play as many cards as you want, as
            long as you have enough action points.
        </p>
        <p>
            You can also place at most 1 card down as a station card.
        </p>
        <p id="infoMode-actionRow">
            This row in your station determines how many action points you have in your action phase. You don't keep
            excess action points between turns.
        </p>
    </div>
</template>
<script>
    import LinesMixin from "../LinesMixin.js";

    export default {
        name: 'ActionPhase',
        mixins: [LinesMixin([
            ['#infoMode-actionRow', '.playerStation-actionRow']
        ])]
    }
</script>
