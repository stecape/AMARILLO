import db_api from './db_api.js'
import mqtt_api from './mqtt_api.js'
import controls_api from './controls_api.js'
export default function (app, pool) {
//  const pg = require ('pg')

  app.get('/', (req, res) => {
    console.log('express connection')
    res.status(200).send('<p>Express.js BackEnd Server. Ciao!</p>')
  })

  db_api(app, pool)
  mqtt_api(app, pool)
  controls_api(app, pool)
}