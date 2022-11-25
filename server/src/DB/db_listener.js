/////////////////////Event Listener Stuff///////////////////////////////

module.exports = function (connection, pool) {
  return new Promise((innerResolve, reject) => {  
    innerResolve(pool)
    // Creation of the callback that calls pg_notify -> Can also be done with sequelize (better with pg maybe, sequelize need a fixing in the trigger creation - see README.MD)
    pool.query("CREATE OR REPLACE FUNCTION return_data() RETURNS trigger AS $BODY$ BEGIN PERFORM pg_notify('rts_changes', row_to_json(NEW)::text); RETURN NULL; END; $BODY$ LANGUAGE plpgsql VOLATILE COST 100",
      (err, result) => {
        if (err) {
          return console.error('Error executing query', err.stack)
        } else {
          console.log("Function created: ", result)
          // Creation of the trigger that calls the callback
          pool.query("CREATE OR REPLACE TRIGGER \"TagCh\" AFTER UPDATE ON \"Tag\" FOR EACH ROW EXECUTE PROCEDURE return_data();",
          (err, result) => {
            if (err) {
              return console.error('Error executing query', err.stack)
            } else {
              console.log('Trigger created: ', result)
            }
          })
        }
    })


    // Creating the connection that will remains on listen for notifications
    pool.connect(function(err, client) {
      if(err) {
        console.log(err);
      }else{
        console.log ("pool connected")
      }

      // Listen for all pg_notify channel messages
      client.on('notification', function(msg) {
        let payload = JSON.parse(msg.payload);
        console.log(payload)
        connection.emit('message', payload.value)
      });
      
      // Designate which channels we are listening on. Add additional channels with multiple lines.
      client.query('LISTEN rts_changes');
    });

  }
)}
/////////////////////Event Listener Stuff Fine///////////////////////////////