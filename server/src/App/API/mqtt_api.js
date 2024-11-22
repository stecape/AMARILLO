const mqtt = require("mqtt")
const mqttClient = mqtt.connect("mqtt://localhost:1883");

mqttClient.on("connect", () => {
  mqttClient.subscribe("feedback", (err) => {
    if (!err) {
      mqttClient.publish("feedback", "Hello mqtt");
    }
  });
});

const mqttWrite = (command) => {
  mqttClient.publish("command", JSON.stringify(command))
}


module.exports = function (app, pool) {

  
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
    mqttWrite([req.body.id, req.body.value])
    res.status(200)
  })

  mqttClient.on("message", (topic, message) => {
    data = JSON.parse(message.toString())
    queryString=`UPDATE "Tag" SET value = '${JSON.stringify({value: data.value})}' WHERE id = ${data.id}`
    console.log(queryString)
        pool.query({
          text: queryString,
          rowMode: 'array'
        })
    //mqttClient.end();
  })
  
}