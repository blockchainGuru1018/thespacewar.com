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
1. Install webpack globally with "npm install webpack -g"
1. Install webpack-cli globally with "npm install webpack-cli -g"
1. Run npm install in the root directory
1. Run npm install in the /client directory
1. Run npm install in the /server directory
1. Run npm install in the /shared directory
1. In /client directory run "webpack" (you have now built the client code)
1. In /scripts run "node ./startInDevelopment.js" (you are now running the server on localhost:8080)

#Development

* All relevant scripts are available in the roots package.json.

* Run relevant tests for you current commit in watch mode: *npm run dev:test*

* Run webpack in watch mode for client code: *npm run dev:client*

* Start server in development mode: *npm run dev:server*

There is a pre-commit hook that will make sure all relevant tests are pass.
There is also a pre-push hook that will make sure _all_ tests are passing.
