import globalEventEmitter from '../Helpers/globalEventEmitter.js'
import mqtt from 'mqtt'
import { mqtt_client_id } from '../App/app_config.js'

export var mqttClient = {connected: false}

export default function (app, pool) {

  let devices = []

  mqttClient = mqtt.connect("mqtt://localhost:1883", {
    clientId: mqtt_client_id, // Opzionale: identificativo del client
    clean: true, // Opzionale: indica se il broker deve mantenere lo stato del client
  })

  // Funzione per recuperare l'elenco dei dispositivi dal database
  const getDevices = async () => {
    const query = 'SELECT name FROM "Device"'
    try {
      const result = await pool.query(query)
      return result.rows.map(row => row.name)
    } catch (err) {
      console.error("Error fetching devices from DB:", err)
      return []
    }
  }

  // Funzione per eseguire la subscription per ogni dispositivo
  const subscribeToDevices = async () => {
    mqttClient.subscribe(`/birth`, (err) => {
      if (!err) {
        console.log(`Subscribed to /birth`)
      } else {
        console.error(`Failed to subscribe to /birth:`, err)
      }
    })
    mqttClient.subscribe(`/lwt`, (err) => {
      if (!err) {
        console.log(`Subscribed to /lwt`)
      } else {
        console.error(`Failed to subscribe to /lwt:`, err)
      }
    })
    devices = await getDevices()
    devices.forEach(device => {
      mqttClient.subscribe(`/feedback/${device}`, (err) => {
        if (!err) {
          console.log(`Subscribed to /feedback/${device}`)
        } else {
          console.error(`Failed to subscribe to /feedback/${device}:`, err)
        }
      })
    })
  }

  // Funzione per annullare tutte le subscription
  const unsubscribeFromAllDevices = async () => {
    mqttClient.unsubscribe(`/feedback/#`, (err) => {
      if (!err) {
        console.log(`Unsubscribed from /feedback/#`)
      } else {
        console.error(`Failed to unsubscribe from /feedback/#:`, err)
      }
    })
  }

  //emissione di eventi per comunicare al client lo stato della connessione
  mqttClient.on("connect", async () => {
    console.log("Connected to MQTT broker")
    globalEventEmitter.emit('mqttConnected')
    await subscribeToDevices()
    devices.forEach(device => {
      //request the HMI values
      mqttClient.publish(`/command/${device}`, JSON.stringify({id: 0, value: 2}))
      //request the Ping to get the status of the device
      mqttClient.publish(`/command/${device}`, JSON.stringify({id: 0, value: 3}))
      //request the actual device time to store the shifting from the server in the database
      mqttClient.publish(`/command/${device}`, JSON.stringify({id: 0, value: 5}))
    })
    //ask for a refresh of the HMI values with the payload {id: 0, value: 2} to all the devices in the table "Device"

  })

  mqttClient.on("error", () => {
    globalEventEmitter.emit('mqttDisconnected')
  })

  mqttClient.on("close", () => {
    globalEventEmitter.emit('mqttDisconnected')
  })

  mqttClient.on("end", () => {
    globalEventEmitter.emit('mqttDisconnected')
  })

  mqttClient.on("disconnect", () => {
    globalEventEmitter.emit('mqttDisconnected')
  })
  //

  const mqttWrite = (device, command) => {
    console.log(command)
    mqttClient.publish(`/command/${device}`, JSON.stringify(command))
  }
  
  /*
  Write a tag value to controller
  Type:   POST
  Route:  '/api/mqtt/write'
  Body:   {
            id: 45,
            value: 49.5
          }
  Res:    200
  Err:    400
  */
  app.post('/api/mqtt/write', (req, res) => {
    console.log({device: req.body.device, id:req.body.id, value:req.body.value})
    mqttWrite(req.body.device, {id:req.body.id, value:req.body.value})
    res.json({result: {device: req.body.device, id:req.body.id, value:req.body.value}, message: "Message sent"})
  })

/*
  Acknowledge the alarms on each device
  Type:   POST
  Route:  '/api/mqtt/alarms_ack'
  Body:   {
            id: 0,
            value: 4
          }
  Res:    200
  */
  app.post('/api/mqtt/alarms_ack', (req, res) => {
    devices.forEach(device => {
      mqttClient.publish(`/command/${device}`, JSON.stringify({id: 0, value: 4}))
    })
    res.json({result: {status: "ack done"}, message: "Message sent"})
  })





  /*
  {
  "id":615,
  "value": 23
  }
  */
  mqttClient.on("message", async (topic, message) => {
    try {
      const payload = message.toString();
      const data = JSON.parse(payload); // Attempt to parse the message payload
  
      if (topic === "/birth") {
        // Update the status of the device in the "Device" table to 1
        const updateQuery = `UPDATE "Device" SET status = 1 WHERE name = $1`;
        try {
          await pool.query(updateQuery, [data.deviceId]);
          console.log(`Device ${data.deviceId} status updated to 1`);
  
          // Publish the command to get the HMI values
          await mqttClient.publish(`/command/${data.deviceId}`, JSON.stringify({ id: 0, value: 2 }));
          // Publish the command to get the device time
          await mqttClient.publish(`/command/${data.deviceId}`, JSON.stringify({ id: 0, value: 5 }));
        } catch (err) {
          console.error(`Failed to update status for device ${data.deviceId}:`, err);
        }
      } else if (topic === "/lwt") {
        // Update the status of the device in the "Device" table to 0
        console.log(`Device ${data.deviceId} went offline`);
        const updateQuery = `UPDATE "Device" SET status = 0 WHERE name = $1`;
        try {
          await pool.query(updateQuery, [data.deviceId]);
          console.log(`Device ${data.deviceId} status updated to 0`);
        } catch (err) {
          console.error(`Failed to update status for device ${data.deviceId}:`, err);
        }
      } else {
        // Handle other topics
        if (data && (data.id !== undefined && data.value !== undefined) || data.deviceId !== undefined) { // Validate the parsed data
          if (data.id == 0) {
            if (data.value == 3) {
              // Update the status of the device in the "Device" table to 1
              const updateQuery = `UPDATE "Device" SET status = 1 WHERE name = $1`; 
              try {
                await pool.query(updateQuery, [data.deviceId]);
                console.log(`Device ${data.deviceId} status updated to 1`);
              } catch (err) {
                console.error(`Failed to update status for device ${data.deviceId}:`, err);
              }
            } else if (data.value == 5) {
              // Update the time shifting of the device relative to server utc in the "Device" table
              const updateQuery = `UPDATE "Device" SET utc_offset = $1 WHERE name = $2`;
              try {
                const serverTime = Date.now(); // Current server UTC timestamp in milliseconds
                const timeDifference = serverTime-data.utc_offset; // Calculate the time difference
                await pool.query(updateQuery, [timeDifference, data.deviceId]);
              } catch (err) {
                console.error(`Failed to update time for device ${data.deviceId}:`, err);
              }
            }
          } else {
            // Update the value of the tag in the "Tag" table
            const queryString = `UPDATE "Tag" SET value = '${JSON.stringify({ value: data.value })}' WHERE id = ${data.id}`;
            //console.log(queryString);
            pool.query({
              text: queryString,
              rowMode: 'array',
            });
            //console.log(`Updated tag ${data.id} with value ${data.value}`);
          } 
        } else {
          console.error("Invalid data format received:", data);
        }
      }
    } catch (err) {
      console.error("Failed to process MQTT message:", err.message, "Message:", message.toString());
    }
  });

  // Ascolta gli eventi emessi dalla CRUD API
  globalEventEmitter.on('deviceAdded', async () => {
    await unsubscribeFromAllDevices()
    await subscribeToDevices()
  })

  globalEventEmitter.on('deviceUpdated', async () => {
    await unsubscribeFromAllDevices()
    await subscribeToDevices()
  })

  globalEventEmitter.on('deviceDeleted', async () => {
    await unsubscribeFromAllDevices()
    await subscribeToDevices()
  })

}