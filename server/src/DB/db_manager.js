import pkg from 'pg'
import { db_dialect, db_user, db_password, db_host, db_port, db_name } from './db_config.js'
import db_filler from './db_filler.js'
import db_listener from './db_listener.js'

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
      .then((pool) => {
        db_listener(pool)
          .then((pool) => {
            resolve(pool)
          })
          .catch((err) => {
            console.error("db_manager: Error setting up listeners", err)
            // Retry initialization
            setTimeout(() => db_manager().then(resolve).catch(reject), 5000) // Retry after 5 seconds
          })
      })
      .catch((err) => {
        console.error("db_manager: Initialization error")
        // Retry initialization
        setTimeout(() => db_manager().then(resolve).catch(reject), 5000) // Retry after 5 seconds
      })
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

export function db_manager() {
  return new Promise((resolve, reject) => {
    createPool()
    initialize()
      .then((pool) => {
        db_listener(pool)
          .then((pool) => {
            resolve(pool)
          })
          .catch((err) => {
            console.error("db_manager: Error setting up listeners", err)
            // Retry initialization
            setTimeout(() => db_manager().then(resolve).catch(reject), 5000) // Retry after 5 seconds
          })
      })
      .catch((err) => {
        console.error("db_manager: Initialization error")
        // Retry initialization
        setTimeout(() => db_manager().then(resolve).catch(reject), 5000) // Retry after 5 seconds
      })
  })
}

export default { db_manager }
