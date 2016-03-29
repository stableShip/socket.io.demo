# demo of socket.io
demo of socket.io

## Install Typescript
`npm install -g typescript`

## Compile app.ts
`tsc app.ts --module commonjs`

## Run single server
`node app.js`

## Run mutiple server

### Install pm2
`npm install pm2 -g`

### Start servers with pm2
`pm2 start pm2_multiple_server_for_nginx.json`

### Set nginx config
copy `socketio_multiple_server.conf` to your nginx server conf and include it,then restart nginx

### visit
[localhost](http://localhost)
