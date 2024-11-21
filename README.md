# What is AMARILLO
MQTT ComDriver between a Node-React-Express-PostgreSQL WebApp and ESP32
# Getting Started
You need a Postgres database running. Docker is a good solution.

configure your preferences in `server\src\DB\db_config.js`
configure your preferences in `server\src\App\app_config.js`

You need a MQTT Broker running somewhere. A good solution is to use Doker and run an istance of Eclipse/mosquitto.
Remember to customize the `\mosquitto\config\mosquitto.config` adding:
`listener 1883`
`allow_anonymous true`

Of course the outer port must be `1883`

## Available Scripts

In the client directory, you can run:

### `npm install`
### `npm start`

In the server directory, you can run:

### `npm install`
### `npm run watch`
