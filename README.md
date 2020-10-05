Not open source. Copyright and all rights reserved etc. 
__________________________

# TLDR;
`npm run install-all` - Install all the dependencies for everything. Works most of the time.

`npm run dev` - Runs all dependencies for testing locally inside one terminal session. Rerun this command everytime you want your changes to the server code to have effect. The client code is rebuilt automatically.

When you commit, the tests are run that are affected by the code you changed. If you cannot commit, you probably made a test fail.

When you push, _all tests_ are run. If you cannot push, you probably made a test fail.

`npm run test` - Runs all tests right now.

Important! The server is pulling from this repo (master branch) each minute with a cron. Make sure to test locally before pushing your commits to the master branch.

__________________________

# Software installed on this server
* Node 12.16.2
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

Setup for development
-
* Node must be installed on the machine to run development tools 

* Clone the repository anywhere and follow steps above FROM the root of the repository:

1. Run "npm run install-all" from the project root directory.

If that doesn't work, and you are on Linux, try running the install script in the /scripts directory: "bash ./scripts/install"

If nothing above works, then execute all the commands in the install script manually by yourself in the terminal.

Development
-
* All relevant scripts are available in the project root's package.json.

* Run relevant tests for you current commit in watch mode: `npm run dev:test`

* You can run everything else needed for development by using: `npm run dev`

If you want to run everything separately, use the following commands in separate terminal sessions:

* Run webpack in watch mode for client code: `npm run dev:client`

* Start server in development mode: `npm run dev:server`

* Start fake login server: `npm run dev:login`

* Start fake score server: `npm run dev:score`

There is a pre-commit hook that will make sure all relevant tests are pass.
There is also a pre-push hook that will make sure **all** tests are passing.

Note: Servers are not running with any source code monitor, so you have to restart the server to make changes have effect when developing locally.

Using feature toggles
-
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


To deploy new code
-
1. When pushing new changes to master the server will take circa 60 seconds to detect any new changes.
1. After that it will update and install any new dependencies and build the client bundle.
1. Then it will restart the server when there are no players online. First then will your changes be available.

Testing 
-
Testing is very important to keeping a complex application like this alive. 
When I have, during small periods of time, not written tests here, the codebase has gotten considerable harder
to work with. So please, write the tests. It will make your life easier, even in the short term.

I started writing the tests with a library called Bocha, a niche library based on Mocha.
Now I'm using Jest. Bocha is still used in the client code for asserting on the DOM.

The legacy tests that you can find are using bocha syntax. Every legacy test file has a small Jest adapter file which is the one that Jest picks up and runs during test runs.

/client 
-
The GUI is tested mostly through integration tests. 
We avoid testing business logic here, instead focuses on interactions and messages sent to the server from certain actions.

- Avoid testing static content HTML.
- Do test paths that go from an action to sending a message to the server, these are important.
- Do test branching logic.
- When something feels like you've already written it on the backend, try to move this common code to /shared and test it there instead.
- The test suite follows a classicist approach and uses only a few mocks, like the communication with the server.
Tests are set up with real objects and with real data. Advantages are tests that don't break while refactoring and test-names that
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

API Endpoints of the cards
-
* https://admin.thespacewar.com/services/api/cards?deck=all (all cards)
* https://admin.thespacewar.com/services/api/cards?deck=1 (Core deck)
* https://admin.thespacewar.com/services/api/cards?deck=2 (The Swarm deck)
* https://admin.thespacewar.com/services/api/cards?deck=3 (United Stars deck)

Remember
-
Be a good citizen, write the tests! Preferably before the code. When you write the tests TDD-style,
you get better tests, better code, and it's more fun!

Notes from August on Discord 2020-06-22
-
to summarize what we talked about:  
Architecture:  
- Matchmaking: Login, lobby, connects with the server through regular http calls
- Match: Players connect with a Match.js instance on the server through WebSockets.
- Shared: Common code that exists both on the client and the server.

Good to know files (when starting to plan a new feature):  
Match.vue - Entry point for most View files when in a match  
MatchStore.js - Entry point for syncing with the server and creating classes found in Shared  
Match.js (server) - Entry point for calls from MatchStore.js via WebSockets. Basically the starting point for any action when in a game against another player!  
server.js - Starting point for the server (good to know if you want to look how it all fits together)  
index.js (client) - Starting point for the client (good to know if you want to look how it all fits together on the front end)

Git:  
Use branches! When it works and you've tested it, make a pull request and drag the task to QA in KanbanFlow. Make sure to include the branch name on the card in KanbanFlow as well as to include the link to the Pull Request as a comment.

Tests:  
/client: High-level testing for a Match (see Architecture above). Almost no tests regarding Matchmaking (see Architecture above).  
/server: High-level testing against Match.js. Almost no tests regarding Matchmaking.  
/shared: Unit tests on individual classes (mostly)

Policy for the /config.json file
-
Only Jim Westergren is allowed to change values of the constants in the /config.json file. If you want/need to change a value ask him first for approval.

# Developer collaboration guidelines

# Git commit messages (2020-07-06)
Short _descriptive_ summary of what you have done: "Can now save a game through the escape menu"
Or very short _non-descriptive_ when the change is _insignificant_ or a _simple refactoring_: "..." or "Refactor"

# Trunk based develop (2020-07-06)
Have short lived branches, less than a day. Basically, work _directly_ into master.
How? We use feature-branches or branch-by-abstraction.

Feature branching:
    You hide some functionality behind a boolean stores in for example local storage
    "if(myToggle) { showMyCode() }"

Branch by abstraction:
    app.get('/new-feature', NewFeatureHandler());
    ...but then there is no frontend code that uses it yet.

When we start working on a new feature:
1. Hide your new code behind a feature toggle.
1. Develop your code.
1. PUSH TO MASTER
1. Develop your code.
1. PUSH TO MASTER
1. Remove the feature toggle.

When should I _reeeaaally_ add a feature toggle..?
- You know you will implement front end code.
- You really think it will take more than a couple of hours.

So this is called Trunk Based Development.
Every commit goes to master, passes all the tests, breaks no previous code, and is _not_ visible to the user until it's ready.

It's great for:
- No merge conflicts
- You don't implement things twice
- You get early feedback on your solution
- And things _always_ work

# Formatters (2020-07-06)
Use ESLint. We don't want to talk about formatting. When we have a discussion around formatting... we automate by adding a rule to ESLint.

# Collaborating (2020-07-06)
- There should some constant collaboration. We want to learn from each others mistakes, share successes.
- We work on stuff that is somewhat related, so that we _have_ that collaboration built into the process.
- Some great tools for collaborating: Pair programming or Mob programming.

# Test-names (2020-07-06)
- /shared (domain code) - we use the name of the class (i.e. PlayerNextPhase.spec.js), and they end with .spec.js
- /server (Match.js) - Name the file with a common theme for all the tests in a file (i.e. AttackPhase.spec.js). We end the test name with .spec.js.
- /client (integration tests against Match.vue) Name the file with a common theme for all the tests in a file (i.e. EndGamePopup.test.js). We end test names with .test.js.