import io from 'socket.io-client'
import React from 'react'

const serverIp = process.env.REACT_APP_SERVER_IP || "http://localhost"
export const socket = io(serverIp)
export const SocketContext = React.createContext()