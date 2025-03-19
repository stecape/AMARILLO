import globalEventEmitter from '../Helpers/globalEventEmitter.js'; // Import globalEventEmitter


export default function (client) {
  return new Promise((innerResolve, innerReject) => {

    // Designate which channels we are listening on. Add additional channels with multiple lines.
    client.query('LISTEN changes')
      .then(() => {
        console.log("DB Listener - LISTEN for DB changes")
        innerResolve(client) // Resolve the promise after successful subscription
      })
      .catch((err) => {
        console.log("DB Listener - LISTEN error", err)
        client.release(true) // Close the client connection
        innerReject(err) // Reject the promise
      })

      // Listen for all pg_notify channel messages and loggin them
      client.on('notification', function (msg) {
        let payload = JSON.parse(msg.payload);
        console.log(payload);
        globalEventEmitter.emit('update', payload);
      })
  })
}