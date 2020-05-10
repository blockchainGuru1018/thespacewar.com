<template>
    <div class="game-option">
      <div class="content-option">
          <div class="btn-sign">
            <div class="btn btn-login">
                <a :href="loginUrl">Login</a>
            </div>
            <div class="btn btn-register">
                <a href="https://thespacewar.com/register">Register</a>
            </div>
          </div>

          <hr>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vehicula pharetra elit at dapibus.
            Aenean tincidunt, odio in efficitur faucibus, nibh nisl finibus ligula, eget iaculis justo mauris in purus.
            Quisque convallis maximus dui, et tincidunt ipsum fermentum at.</p>
          <button
              v-if="playAsGuestOn"
              class="btn btn-guest"
              @click="playAgainstAi"
          >
              Play against AI
          </button>
          <button
              v-else
              class="btn btn-guest"
              :disabled="true"
          >
              Play against AI (coming soon)
          </button>
      </div>
      <div id="metal-corner">
          <img src="https://images.thespacewar.com/metal-corner.png" alt="">
      </div>
    </div>

</template>

<script>
    import featureToggles from "../utils/featureToggles";

    const Vuex = require('vuex');
    const loginHelpers = Vuex.createNamespacedHelpers('login');
    const guestHelpers = Vuex.createNamespacedHelpers('guest');
    const User = require('../../shared/user/User.js');

    export default {
        name: "StartGameOption",
        computed: {
            usernameMaxLength() {
                return User.MaxNameLength;
            },
            loginUrl() {
                if (runningInLocalDevelopmentEnvironment()) {
                    return 'http://localhost:8081/fake-login';
                } else {
                    return 'https://thespacewar.com/login';
                }
            },
            playAsGuestOn() {
                return true;
                //return featureToggles.isEnabled('playAsGuest');
            }
        },
        methods: {
            ...loginHelpers.mapActions([
                'login'
            ]),
            ...guestHelpers.mapActions([
                'playAgainstAi'
            ]),
        }
    }

    function runningInLocalDevelopmentEnvironment() {
        return window.location.hostname === 'localhost';
    }
</script>

<style scoped lang="scss">
    @import "../client/match/_colors.scss";

    .view-wrapper {
        display: block !important;
    }

    .game-option {
        position: relative;
        z-index: 2;
        text-align: center;
        background: url(https://images.thespacewar.com/intro-frame.png);
        background-position: right bottom;
        // background-size: contain;
        max-width: 990px;
        width: 100%;
        min-height: 380px;
        background-repeat: no-repeat;

        .content-option{
          max-width: 520px;
          margin-top: 80px;
          margin-right: 80px;
          float: right;

          .btn-sign{
            margin: 15px 0px;
          }
          hr {
              border-bottom: 3px solid #fff;
              border-top: none;
              border-right: none;
              border-left: none;
          }
          p{color: $linkWhite;}
          .btn {
              font-family: "Space Mono", monospace;
              font-size: 1em;
              display: inline-block;
              margin: 0 4px;
              color: $linkWhite;

              a {
                  color: $linkWhite;
                  text-decoration: none;
              }

              &.btn-login {
                text-transform: uppercase;
              }

              &.btn-register {
                text-transform: uppercase;
              }

              &.btn-guest {
                  clear: both;
                  background-color: #66cc00;
                  border: 2px solid #72f200;
                  width: 80%;
                  margin: 0 auto;
                  padding: 5px 12px;
                  display: block;
                  text-transform: uppercase;

                  &:hover:not(:disabled) {
                      color: #dfdfdf;
                      background-color: #222422;
                      cursor: pointer;
                  }

                  &:disabled {
                      color: #999;
                  }
              }
          }
        }

    }
    #metal-corner{
      position: fixed;
      z-index: 3;
      right: -5px;
      bottom: -15px;
    }

    @media only screen and (max-width: 425px)
    {
      .game-option {
        .content-option{

        }
      }
    }
</style>
