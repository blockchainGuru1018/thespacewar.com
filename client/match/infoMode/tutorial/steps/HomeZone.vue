<template>
    <div class="infoMode-step">
        <h2>Home zone</h2>
        <p id="infoMode-homeZone">
            You always play your cards here, at the lower side of your home zone.
        </p>
    </div>
</template>
<script>
    import LinesMixin from "../LinesMixin.js";

    export default {
        name: 'HomeZone',
        mixins: [LinesMixin([
            ['#infoMode-homeZone', '.playerCardsInZone']
        ])]
    }
</script>
