const db_api = require('./db_api')
const mqtt_api = require('./mqtt_api')
module.exports = function (app, pool) {
  const pg = require ('pg')

  app.get('/', (req, res) => {
    console.log('express connection')
    res.status(200).send('<p>Express.js BackEnd Server. Ciao!</p>')
  })

  db_api(app, pool)
  mqtt_api(app, pool)
}