import { useContext, useRef } from "react"
import {
  Layout,
  LayoutAppBar,
  useLayoutNavigation,
  useCrossFadeTransition,
  useIsomorphicLayoutEffect
} from "react-md"
import {
  AppBarTitle,
  APP_BAR_OFFSET_CLASSNAME
} from "@react-md/app-bar"
import { PhonelinkEraseFontIcon } from "@react-md/material-icons"
import { StayPrimaryPortraitFontIcon } from "@react-md/material-icons"
import { CloudOffFontIcon } from "@react-md/material-icons"
import { CloudQueueFontIcon } from "@react-md/material-icons"
import { WifiTetheringFontIcon } from "@react-md/material-icons"
import { SignalWifiOffFontIcon } from "@react-md/material-icons"
import { useLocation, Link } from "react-router-dom"
import { ctxData } from "./Helpers/CtxProvider"
import navItems from "./navItems"

import './styles/Layout.scss'

import App from "./App"
const appBar = (pathname, backendConnected, dbConnected, mqttConnected) => {
  return (
    <LayoutAppBar theme="primary">
      <AppBarTitle
        className="rmd-typography--capitalize"
      >
        <>Amarillo - {pathname.replace("/", "").toUpperCase()}</>
      </AppBarTitle>

      {mqttConnected ? <WifiTetheringFontIcon className="icon-black" /> : <SignalWifiOffFontIcon className="icon-black" />}
      {dbConnected ? <StayPrimaryPortraitFontIcon className="icon-black" /> : <PhonelinkEraseFontIcon className="icon-black" />}
      {backendConnected ? <CloudQueueFontIcon className="icon-black" /> : <CloudOffFontIcon className="icon-black" />}
    </LayoutAppBar>
  )
}

export default function MyLayout() {
  const ctx = useContext(ctxData)
  const { pathname } = useLocation()
  const prevPathname = useRef(pathname)
  const { elementProps, transitionTo } = useCrossFadeTransition()
  useIsomorphicLayoutEffect(() => {
    if (pathname === prevPathname.current) {
      return
    }

    prevPathname.current = pathname
    transitionTo('enter')
  }, [pathname, transitionTo])

  return (
    <Layout
      appBar={appBar(pathname, ctx.backendStatus.backendConnected, ctx.backendStatus.dbConnected, ctx.backendStatus.mqttConnected)}
      navHeaderTitle="Menu"
      treeProps={useLayoutNavigation(navItems, pathname, Link)}
      mainProps={elementProps}
    >
      <div className={APP_BAR_OFFSET_CLASSNAME}>
        <App />
      </div>
    </Layout>
  )
}