<template>
    <div>
        <PileDescriptions />
        <StationDescriptions />
    </div>
</template>

<script>
    import PileDescriptions from "./PileDescriptions.vue";
    import StationDescriptions from "./StationDescriptions.vue";

    export default {
        name: 'GuiDescriptions',
        components: { StationDescriptions, PileDescriptions }
    }
</script>
