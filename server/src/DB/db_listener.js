/////////////////////Event Listener Stuff///////////////////////////////

export default function (connection, pool) {
  return new Promise((innerResolve, innerReject) => {  
    innerResolve(pool)


    // Creating the connection that will remains on listen for notifications
    pool.connect(function(err, client) {
      if(err) {
        console.log("Connection error", err)
        innerReject(err); // Reject the promise if there's a connection error
      }else{
        console.log ("pool connected")
      }

      // Handle client errors
      client.on('error', function(clientError) {
        console.log("Client error", clientError)
        innerReject(err); // Reject the promise if there's a client error
      })

      client.on('end', () => {
        console.log("Client disconnected")
        innerReject(err); // Reject the promise if there's a client error
      })

      // Listen for all pg_notify channel messages
      client.on('notification', function(msg) {
        let payload = JSON.parse(msg.payload)
        console.log(payload)
        connection.emit('update', payload)
      })
      
      // Designate which channels we are listening on. Add additional channels with multiple lines.
      client.query('LISTEN changes')
    })

  }
)}
/////////////////////Event Listener Stuff Fine///////////////////////////////