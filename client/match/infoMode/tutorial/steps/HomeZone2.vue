<template>
    <div class="infoMode-step">
        <h2>Home zone</h2>
        <p id="infoMode-opponentCardsInHomeZone">
            Cards can only attack cards in the same zone. For your opponent to attack your station cards, they must move
            their cards to the upper side of your home zone.
        </p>
    </div>
</template>
<script>
    import LinesMixin from "../LinesMixin.js";

    export default {
        name: 'HomeZone2',
        mixins: [LinesMixin([
            ['#infoMode-opponentCardsInHomeZone', '.opponentCardsInPlayerZone']
        ])]
    }
</script>
