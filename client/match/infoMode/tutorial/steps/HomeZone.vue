<template>
    <div class="infoMode-step">
        <h2>Home zone</h2>
        <p id="infoMode-homeZone">
            This is your home zone. You always play your cards here.
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
