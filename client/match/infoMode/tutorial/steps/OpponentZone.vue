<template>
    <div class="infoMode-step">
        <h2>Opponent zone</h2>
        <div class="infoMode-spacer" />
        <p id="infoMode-opponentZone">
            Likewise, you must move your cards to the opponents home zone in order to attack their station cards.
        </p>
    </div>
</template>
<script>
    import LinesMixin from "../LinesMixin.js";

    export default {
        name: 'OpponentZone',
        mixins: [LinesMixin([
            ['#infoMode-opponentZone', '.playerCardsInOpponentZone']
        ])]
    }
</script>
