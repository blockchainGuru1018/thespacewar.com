<template>
    <div class="modal-backdrop">
        <div class="modal">
            <header class="modal-header">
                <slot name="header">
                    This is the default tile!
                    <button
                        type="button"
                        class="btn-close"
                        @click="close"
                    >
                        x
                    </button>
                </slot>
            </header>
            <section class="modal-body">
                <slot name="body">
                    I'm the default body!
                </slot>
            </section>
            <footer class="modal-footer">
                <slot name="footer">
                    I'm the default footer!

                    <button
                        type="button"
                        class="btn-green"
                        @click="close"
                    >
                        Close me!
                    </button>
                    <button
                        type="button"
                        class="btn-green"
                        @click="confirm"
                    >
                        yes!
                    </button>
                </slot>
            </footer>
        </div>
    </div>
</template>
<script>
    export default {
        name: "ConfirmationDialog",
        methods: {
            close() {
                this.$emit('close');
            },
            confirm() {
                this.$emit('confirm');
            }
        }
    }
</script>

<style lang="scss" scoped>
    .modal-backdrop {
        position: fixed;
        top: 0;
        z-index: 9999;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.4);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .modal {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        margin: 30px auto;
        flex-direction: column;
        align-items: stretch;
        padding: 20px 0;
        background: linear-gradient(to bottom, #0a0a14, #140a0a);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        overflow-x: auto;
    }

    .modal-header,
    .modal-footer {
        padding: 15px;
        display: flex;
    }

    .modal-header {
        border-bottom: 1px solid #eeeeee;
        color: #4AAE9B;
        justify-content: space-between;
    }

    .modal-footer {
        border-top: 1px solid #eeeeee;
        justify-content: flex-end;
    }

    .modal-body {
        position: relative;
        padding: 20px 10px;
    }

    .btn-close {
        border: none;
        font-size: 20px;
        padding: 20px;
        cursor: pointer;
        font-weight: bold;
        color: #4AAE9B;
        background: transparent;
    }

    .btn-green {
        color: white;
        background: #4AAE9B;
        border: 1px solid #4AAE9B;
        border-radius: 2px;
    }
</style>