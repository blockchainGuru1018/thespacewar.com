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

Note: The package.json on the root level of the project is for development dependencies.
Modules added there will not be installed in production and should not be referred to in code.

#Testing 

Testing is very important to keeping a complex application like this alive. 
When I have, during small periods of time, not written tests here, the codebase has gotten considerable harder
to work with. So please, write the tests. It will make your life easier, even in the short term.

I started writing the tests with a library called Bocha, a niche library based on Mocha.
Now I'm using Jest. Bocha is still used in the client code for asserting on the DOM.

/client 
-
The GUI is tested mostly through integration tests. 
We avoid testing business logic here, instead focuses on interactions and messages sent to the server from certain actions.

- Avoid testing static content HTML.
- Do test paths that go from an action to sending a message to the server, these are important.
- Do test branching logic.
- When something feels like you've already written it on the backend, try to move this common code to /shared and test it there instead.
- The test suite follows a classicist approach and uses only a few mocks, like the communication with the server.
The reset is set up with real objects and with real data. Advantages are tests that don't break while refactoring and test-names that
are closely related to a known requirement. A major disadvantage is that to setup a test you need a deep understanding of the state that makes up the game.

/server
-
Some parts of the server has very few tests, those parts are mostly the fringe. Like setting up routes etc.

Otherwise the code has been developed with Outside-in TDD. You will notice that there are a lot of tests on the 
`Match.js` file. This were mostly the "Outside". So again, these tests are classicist and use very few mocks. The same pros/cons apply
as for the tests on the client code.

Over time however I realized that I was feeling these tests were not small enough and so I have also driven some tests
directly on smaller classes instead of through the Match.js interface.

Over time I also realized a lot of the logic between the server and client was the same, and this has been
refactored into classes that you can find in the `/shared` folder.

/shared
- 
This folder contains all the "domain" logic. These are shared between the client and the server.

Tests here are mostly directly towards some specific class and are more mockist than classicist.

Remember
-
Be a good citizen, write the tests! Preferably before the code. When you write the tests TDD-style,
you get better tests, better code, and it's more fun!
