<template>
    <div class="commanderCards">
        <CommanderCard
            v-for="commander in commanders"
            :key="commander"
            :commander="commander"
            :expandable="true"
            :turnedAround="turnedAround"
        />
    </div>
</template>
<script>
    const resolveModule = require('../../utils/resolveModuleWithPossibleDefault.js');
    const CommanderCard = resolveModule(require('./CommanderCard.vue'));

    module.exports = {
        props: ['commanders', 'turnedAround'],
        components: {
            CommanderCard
        }
    }
</script>
<style lang="scss">
    .commanderCards {
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
