<template>
    <div class="toggle-container-deck" v-if="swarmDeckToggleVisible">
        <label> Swarm Deck</label>
        <button v-if="switchType === 'off'" v-on:click="activateToggleDeck" class="btn btn-toggle">
            <svg id="switch-off" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 238.93"
                 class="switch-icon">
                <path d="M119.47,34.2a85.34,85.34,0,1,0,85.33,85.33A85.43,85.43,0,0,0,119.47,34.2Zm0,153.6a68.27,68.27,0,1,1,68.26-68.27A68.35,68.35,0,0,1,119.47,187.8Z"
                      transform="translate(0 -0.07)" fill="#ffffff"/>
                <path d="M392.53.07H119.47a119.47,119.47,0,1,0,0,238.93H392.53a119.47,119.47,0,1,0,0-238.93Zm0,221.86H119.47a102.4,102.4,0,0,1,0-204.8H392.53a102.4,102.4,0,1,1,0,204.8Z"
                      transform="translate(0 -0.07)" fill="#ffffff"/>
            </svg>
        </button>
        <button v-else class="btn btn-toggle" v-on:click="deactivateToggleDeck">
            <svg id="switch-on" data-name="Capa 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 238.93"
                 class="switch-icon">
                <path d="M119.8,238.93H392.87A119.47,119.47,0,0,0,392.87,0H119.8a119.47,119.47,0,1,0,0,238.93ZM392.87,34.13a85.34,85.34,0,1,1-85.34,85.34A85.43,85.43,0,0,1,392.87,34.13Z"
                      transform="translate(-0.33)" fill="#ffffff"/>
            </svg>
        </button>
    </div>
</template>

<script>
    import featureToggles from '../utils/featureToggles.js';

    export default {
        name: "ToggleSwarmDeckButton",
        data() {
            return {
                switchType: 'off',
                nameKeyToggleDeck: 'ft-useTheSwarmDeck'
            };
        },
        computed: {
            swarmDeckToggleVisible() {
                return featureToggles.isEnabled('swarm-toggle');
            }
        },
        mounted() {
            this.checkTypeToggleButton();
        },
        methods: {
            activateToggleDeck() {
                localStorage.setItem(this.nameKeyToggleDeck, 'true');
                this.switchType = 'on'
            },
            deactivateToggleDeck() {
                localStorage.setItem(this.nameKeyToggleDeck, '');
                this.switchType = 'off'
            },
            checkTypeToggleButton() {
                if (localStorage.getItem(this.nameKeyToggleDeck) == null) {
                    this.switchType = 'off';
                } else {
                    if (localStorage.getItem(this.nameKeyToggleDeck) === 'true') {
                        this.switchType = 'on';
                    } else {
                        this.switchType = 'off';
                    }
                }
            }
        },
    }
</script>

<style scoped lang="scss">
    .toggle-container-deck {
        position: fixed;
        z-index: auto;
        right: 10px;
        width: 155px;
        top: 10px;

        label {
            float: left;
            font-family: "Space Mono", monospace;
            color: #fff;
            font-size: 13px;
            text-transform: uppercase;
            padding: 5px 0;
            margin-right: 4px;
        }

        .btn {
            width: 60px;
            background-color: #00000047;
            border: none;
            padding: 0;
            margin: 0;
            display: block;
            border-radius: 20px;
            cursor: pointer;

            &.btn-toggle {
                &:hover {
                    background-color: #00000082;
                }

                .switch-icon {
                    width: 100%;
                    vertical-align: middle;
                }
            }

        }
    }
</style>