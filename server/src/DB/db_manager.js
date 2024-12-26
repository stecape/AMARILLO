import pkg from 'pg'
import { db_dialect, db_user, db_password, db_host, db_port, db_name } from './db_config.js'
import db_filler from './db_filler.js'
import db_listener from './db_listener.js'
import app_api from '../App/API/api.js'
import app_ws, { close } from '../App/app_ws.js'

const connStr = `${db_dialect}://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}`
let pool

function createPool() {
  const {Pool} = pkg
  pool = new Pool({ connectionString: connStr })
  pool.on('error', handlePoolError)
}

function handlePoolError(err) {
  console.error('handlePoolError: Unexpected error on idle client')
  console.log('handlePoolError: Retrying connection...')
  setTimeout(() => {
    createPool()
    initialize()
  }, 5000) // Retry after 5 seconds
}

function initialize() {
  return new Promise((resolve, reject) => {
    pool.connect((err, client, done) => {
      if (err) {
        console.error("Initialize: Connection error")
        reject(err)
      } else {
        console.log("Initialize: Pool connected")
        done() // Release the client back to the pool
        db_filler(pool)
          .then(() => {
            resolve(pool)
          })
          .catch((err) => {
            console.error("Initialize: Error filling the database", err)
            reject(err)
          })
      }
    })
  })
}

export function startApp() {
  createPool()
  initialize()
    .then((pool) => {
      const wsRet = app_ws()
      const ReactWSConnection = wsRet.connection
      const expressApp = wsRet.expressApp
      db_listener(ReactWSConnection, pool)
        .then(() => app_api(expressApp, pool))
        .catch((err) => {
          console.error("Error setting up listeners", err)
          // Close WebSocket server before retrying
          close()
          // Retry initialization
          setTimeout(startApp, 5000) // Retry after 5 seconds
        })
    })
    .catch((err) => {
      console.error("startApp: Initialization error")
      // Close WebSocket server before retrying
      close()
      // Retry initialization
      setTimeout(startApp, 5000) // Retry after 5 seconds
    })
}


// Gestione globale degli errori
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

export default { startApp }
