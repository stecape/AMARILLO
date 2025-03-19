import pg from 'pg'
import { db_dialect, db_user, db_password, db_host, db_port, db_name } from './db_config.js'
import db_filler from './db_filler.js'
import db_listener from './db_listener.js'
import globalEventEmitter from '../Helpers/globalEventEmitter.js' // Import globalEventEmitter

const connStr = `${db_dialect}://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}`

export var pool
export var dbConnected = false

let initializePromise = null; // Promise condivisa per sincronizzare le chiamate a initialize

function initialize(pool) {
  if (initializePromise) {
    return initializePromise; // Restituisci la Promise condivisa se già in esecuzione
  }

  initializePromise = new Promise((resolve, reject) => {
    pool.connect((err, client) => {
      if (err) {
        console.error("Initialize: Pool connection attempt failed", err)
        dbConnected = false
        globalEventEmitter.emit('dbDisconnected') // Emit the dbDisconnected event
        initializePromise = null; // Resetta la Promise condivisa
        setTimeout(() => initialize(pool).then(resolve).catch(reject), 5000); // Retry after 5 seconds
        return;
      }

      dbConnected = true
      globalEventEmitter.emit('dbConnected') // Emit the dbConnected event
      console.log("Initialize: Pool connected")

      // Handle unexpected errors on client
      client.on('error', (err) => {
        console.error('Unexpected error on idle client', err)
        client.release(true) // Rilascia il client e rimuovilo dal pool
        dbConnected = false;
        globalEventEmitter.emit('dbDisconnected'); // Emit the dbDisconnected event
        initializePromise = null; // Resetta la Promise condivisa
        setTimeout(() => initialize(pool).then(resolve).catch(reject), 5000); // Retry after 5 seconds
      })

      db_filler(client)
        .then(() => {
          initializePromise = null; // Resetta la Promise condivisa
          resolve(client);
        })
        .catch((err) => {
          console.error("Initialize: Error filling the database", err);
          client.release(true); // Rilascia il client e rimuovilo dal pool
          dbConnected = false;
          globalEventEmitter.emit('dbDisconnected'); // Emit the dbDisconnected event
          initializePromise = null; // Resetta la Promise condivisa
          setTimeout(() => initialize(pool).then(resolve).catch(reject), 5000); // Retry after 5 seconds
        });
    });

    // Gestisci errori imprevisti sul pool (registra solo una volta)
    if (!pool._errorHandlerRegistered) {
      pool.on('error', (err) => {
        console.error('Unexpected error on pool', err);
        dbConnected = false;
        globalEventEmitter.emit('dbDisconnected'); // Emit the dbDisconnected event
        initializePromise = null; // Resetta la Promise condivisa
        setTimeout(() => initialize(pool).then(resolve).catch(reject), 5000); // Retry after 5 seconds
      });
      pool._errorHandlerRegistered = true; // Segna il gestore come registrato
    }
  });

  return initializePromise;
}

export function db_manager() {
  return new Promise((resolve, reject) => {
    const {Pool} = pg
    pool = new Pool({
      connectionString: connStr,
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error if a connection is not established in 2 seconds
    })
    
    initialize(pool)
      .then((client) => {
        db_listener(client)
          .then(() => {
            resolve(pool)
          })
          .catch((err) => {
            console.error("db_manager: Error setting up listeners", err)
            reject(err);
          })
      })
      .catch((err) => {
        console.error("db_manager: Initialization error")
        reject(err);
      })
  })
}

export default { db_manager }
