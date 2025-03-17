import globalEventEmitter from '../Helpers/globalEventEmitter.js'; // Import globalEventEmitter

export var dbConnected = false;

export default function (pool) {
  return new Promise((innerResolve, innerReject) => {

    const connectWithRetry = (retryCount = 0) => {
      // Creating the connection that will remain on listen for notifications
      pool.connect(function (err, client) {
        if (err) {
          console.log("DB Listener - Connection error", err);
          const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Exponential backoff with a max delay of 30 seconds
          console.log(`Retrying connection in ${retryDelay / 1000} seconds...`);
          setTimeout(() => connectWithRetry(retryCount + 1), retryDelay);
          return;
        } else {
          console.log("DB Listener - pool connected");
          dbConnected = true;
          globalEventEmitter.emit('dbConnected'); // Emit the dbConnected event
          retryCount = 0;

          // Listen for all pg_notify channel messages
          client.on('notification', function (msg) {
            let payload = JSON.parse(msg.payload);
            console.log(payload);
            globalEventEmitter.emit('update', payload);
          });

          // Designate which channels we are listening on. Add additional channels with multiple lines.
          client.query('LISTEN changes')
            .then(() => {
              innerResolve(pool); // Resolve the promise after successful subscription
            })
            .catch((err) => {
              console.log("DB Listener - LISTEN error", err);
              client.end(); // Close the client connection
              globalEventEmitter.emit('dbDisconnected'); // Emit the dbDisconnected event
              dbConnected = false;
              const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
              console.log(`Retrying connection in ${retryDelay / 1000} seconds...`);
              setTimeout(() => connectWithRetry(retryCount + 1), retryDelay);
            });
        }

        // Handle client errors
        client.on('error', function (clientError) {
          console.log("DB Listener - Client error", clientError);
          client.end(); // Close the client connection
        });

        client.on('end', () => {
          console.log("DB Listener - Client disconnected");
          globalEventEmitter.emit('dbDisconnected'); // Emit the dbDisconnected event
          dbConnected = false;
          const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
          console.log(`Retrying connection in ${retryDelay / 1000} seconds...`);
          setTimeout(() => connectWithRetry(retryCount + 1), retryDelay);
        });
      });
    };

    connectWithRetry();
  });
}