import globalEventEmitter from '../Helpers/globalEventEmitter.js'
import mqtt from 'mqtt'

export default function (app, pool) {
  const mqttClient = mqtt.connect("mqtt://localhost:1883")

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
    const devices = await getDevices()
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

  mqttClient.on("connect", () => {
    subscribeToDevices()
  })
  
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
  {
  "id":615,
  "value": 23
  }
  */
  mqttClient.on("message", (topic, message) => {
    const data = JSON.parse(message.toString())
    const queryString=`UPDATE "Tag" SET value = '${JSON.stringify({value: data.value})}' WHERE id = ${data.id}`
    console.log(queryString)
        pool.query({
          text: queryString,
          rowMode: 'array'
        })
  })  

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