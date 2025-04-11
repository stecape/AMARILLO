import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MessageQueue } from "@react-md/alert"
import { Configuration } from "@react-md/layout"
import { BrowserRouter } from "react-router-dom"
import { SocketContext, socket } from './Helpers/socket'
import { CtxProvider } from "./Helpers/CtxProvider"
import './styles/index.scss'

import Layout from "./Layout"

const rootElement = document.getElementById('root')
const root = createRoot(rootElement)

root.render(
  <StrictMode>
    <MessageQueue id="notify" duplicates="allow">
      <SocketContext.Provider value={socket}>
        <CtxProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Configuration>
              <Layout />
            </Configuration>
          </BrowserRouter>
        </CtxProvider>
      </SocketContext.Provider>
    </MessageQueue>
  </StrictMode>,
)