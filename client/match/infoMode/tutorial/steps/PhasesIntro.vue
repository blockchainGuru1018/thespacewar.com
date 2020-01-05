<template>
    <div class="infoMode-step">
        <h2>Phases</h2>
        <p id="infoMode-fieldDivider">
            At the left end of this field divider there will be a button when you can progress
            to the next phase or end your turn.
        </p>
        <div class="infoMode-spacer--small" />
        <p>
            Your turn consists of four phases: Draw, Action, Discard & Attack.
        </p>
    </div>
</template>
<script>
    import LinesMixin from "../LinesMixin.js";

    export default {
        name: 'PhasesIntro',
        mixins: [LinesMixin([
            ['#infoMode-fieldDivider', '.field-divider']
        ])]
    }
</script>
