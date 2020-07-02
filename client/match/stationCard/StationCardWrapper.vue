<template>
    <div
        class="stationCardWrapper stationCardWrapper--fullSize"
        :style="{pointerEvents: transparent ? 'none' : 'auto'}"
    >
        <slot>
            <div class="card card-placeholder" />
        </slot>
    </div>
</template>
<script>
    module.exports = {
        props: ['transparent']
    };
</script>
