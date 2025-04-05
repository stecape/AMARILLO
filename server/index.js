import app_ws from './src/App/app_ws.js'
import { db_manager } from './src/DB/db_manager.js'
import app_wsMessageBroker from './src/App/app_wsMessageBroker.js'
import backend_api from './src/api/backend_api.js'
import db_api from './src/api/db_api.js'
import mqtt_api from './src/api/mqtt_api.js'
import controls_api from './src/api/controls_api.js'

const startApp = () => {
  //initialize the WebSocket server and the express app
  const {connection, expressApp} = app_ws()
  //initialize the WebSocket message broker, that collects the messages from the globalEventEmitter (backend internal emitter) and sends them to the clients that are destinated to the WebSocket
  app_wsMessageBroker(connection)

  //initialize the backend API, that allows to request the backend status
  backend_api(expressApp)

  //initialize the database manager
  db_manager()
    .then((pool) => {
      db_api(expressApp, pool)
      mqtt_api(expressApp, pool)
      controls_api(expressApp, pool)
    })
    .catch(() => {
      console.error('Index: Error connecting to the database')
    })
}

startApp()


// Global error handling. In case of an unhandled error or unhandled rejection, close the WebSocket server, close the DB, and retry after 5 seconds
/*
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception: ', err) 
  // Close WebSocket server before retrying
  close()
  setTimeout(startApp, 5000) // Retry after 5 seconds
})

 process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  // Close WebSocket server before retrying
  close()
  setTimeout(startApp, 5000) // Retry after 5 seconds
})
*/