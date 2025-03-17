import {dbConnected} from '../DB/db_listener.js' 

export default function (app) {

  app.get('/', (req, res) => {
    console.log('express connection')
    res.status(200).send('<p>Express.js BackEnd Server. Ciao!</p>')
  })

  
  /*
  * Get Backend Status
  * This API returns the status of the backend
  */
  app.post('/api/getBackendStatus', (req, res) => {
    res.json({
      result: {
        dbConnected: dbConnected
      },
      message: "Backend Status retrieved"
    })
  })

}