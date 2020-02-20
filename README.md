Not open source.

Copyright and all rights reserved etc. 
__________________________

The server is pulling from this repo each minute.

# Software installed on this server
* Node 10.12.0
* Npm 6.4.1
* Redis 4.0.9
* Nginx 1.14.0
* Pm2 3.2.2

# Server Spec
* https://www.hetzner.com/dedicated-rootserver/ex41s-ssd
* Intel® Core™ i7-6700 Quad-Core Skylake
* 64 GB DDR4 RAM
* 2 x 250 GB 6 Gb/s SSD (Software-RAID 1)
* 1 Gbit/s bandwidth


__________________________

#Setup for development
* Node must be installed on the machine to run development tools 

1. Clone the repository anywhere
1. Install webpack globally with `npm install webpack -g`
1. Install webpack-cli globally with `npm install webpack-cli -g`
1. Run `npm install` in the root directory
1. Run `npm install` in the /client directory
1. Run `npm install` in the /server directory
1. Run `npm install` in the /shared directory
1. In /client directory run `webpack` (you have now built the client code)
1. In /scripts run `node ./startInDevelopment.js` (you are now running the server on localhost:8080)

#Development

* All relevant scripts are available in the roots package.json.

* Run relevant tests for you current commit in watch mode: `npm run dev:test`

* Run webpack in watch mode for client code: `npm run dev:client`

* Start server in development mode: `npm run dev:server`

There is a pre-commit hook that will make sure all relevant tests are pass.
There is also a pre-push hook that will make sure **all** tests are passing.


#Using feature toggles

Import featureToggles.js and use the method "isEnabled" to determine if a toggle is on. 

All toggles are off by default. 

To turn a toggle on when developing,
in local storage for the site (localhost:8080) add this key value pair:
`ft-nameOfMyFeatureToggle: true`

Example:

In Vue file:
```
<template>
    <div>  
        <marquee v-if="newHeaderVisible">
            New cool header
        </marquee>
        <h1 v-else>
            Old ugly header
        </h1>
    </div>
</template>
<script>
    import {isEnabled} from '../the/path/to/featureToggles.js';
    
    export default {
        computed: {
            newHeaderVisible() {
                return isEnabled('new-header');
            }
        }
    };
</script>
```

In local storage -
Key: `"ft-new-header"`
Value: `"true"`


#To deploy new code

_We are including the build artifacts in version control. They are built on your machine, not on a separate server._
1. Make sure to build the client code locally if you are not running webpack in watch mode.
1. Make sure to include the index.js bundle when commiting and then push it.
1. After about 60 seconds the server will pick up the changes and restart.

Note that when usage scales it would be best to follow a Blue-Green pattern for deployment.
Some things will have to happen until then. There is a task for this in the backlog.

Also note that it might be preferable to build the artifacts on a separate CI server in the future.
We should not get carried away though, maybe wait until we feel more pain with the current setup.
Probably if more developers join we will experience some "works on my machine"-syndrome, that would be our cue.
