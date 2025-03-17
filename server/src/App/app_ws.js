import { ws_port } from './app_config.js'
import cors from 'cors'
import express, { json } from 'express'
import { createServer } from 'http'
import { Server } from "socket.io"

let server

const app_ws = () => {

  //Express App creation
  const app = express()
  app.use(cors())
  app.use(json())
  server = createServer(app)

  //socket.io WebSocket creation and running on the http server
  const io = new Server(server, { cors: { origin: '*' } })
  io.on('connect', s => {
    console.log('socket.io connection', s.id)
    s.on("error", (err) => console.log("Caught socket error: ", err))
  })
  
  //Start listening for http req
  server.listen(ws_port, '0.0.0.0', () => console.log('listening on http://localhost:' + ws_port + '/'))
  return {connection: io, expressApp: app}
}

export function close () {
  if (server) {
    server.close(() => {
      console.log('WebSocket server closed')
    })
    server.removeAllListeners()
  }
}

export default app_ws