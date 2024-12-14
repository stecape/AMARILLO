module.exports = function (app, pool) {
  const mqtt = require("mqtt")
  const mqttClient = mqtt.connect("mqtt://localhost:1883");
  
  mqttClient.on("connect", () => {
    mqttClient.subscribe("/feedback/Pot", (err) => {
      if (!err) {
        mqttClient.publish("hello", "Hello mqtt");
      }
    });
  });
  
  const mqttWrite = (command) => {
    console.log(command)
    mqttClient.publish("/command/Pot", JSON.stringify(command))
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
    console.log({id:req.body.id, value:req.body.value})
    mqttWrite({id:req.body.id, value:req.body.value})
    res.json({result: {id:req.body.id, value:req.body.value}, message: "Message sent"})
  })

  /*
  {
  "id":615,
  "value": 23
  }
  */
  mqttClient.on("message", (topic, message) => {
    data = JSON.parse(message.toString())
    queryString=`UPDATE "Tag" SET value = '${JSON.stringify({value: data.value})}' WHERE id = ${data.id}`
    console.log(queryString)
        pool.query({
          text: queryString,
          rowMode: 'array'
        })
  })
  
}