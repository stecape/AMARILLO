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
import { PhonelinkEraseSVGIcon } from "@react-md/material-icons"
import { StayPrimaryPortraitSVGIcon } from "@react-md/material-icons"
import { CloudOffSVGIcon } from "@react-md/material-icons"
import { CloudQueueSVGIcon } from "@react-md/material-icons"
import { useLocation, Link } from "react-router-dom"
import { ctxData } from "./Helpers/CtxProvider"
import navItems from "./navItems"

import App from "./App"
const appBar = (pathname, backendConnected, dbConnected) => {
  return (
    <LayoutAppBar theme="primary">
      <AppBarTitle
        className="rmd-typography--capitalize"
      >
        <>Amarillo - {pathname.replace("/", "").toUpperCase()}</>
      </AppBarTitle>

      {dbConnected ? <StayPrimaryPortraitSVGIcon style={{ marginRight: "20px" }} /> : <PhonelinkEraseSVGIcon style={{ marginRight: "20px" }} />}
      {backendConnected ? <CloudQueueSVGIcon style={{ marginRight: "20px" }} /> : <CloudOffSVGIcon style={{ marginRight: "20px" }} />}
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
      appBar={appBar(pathname, ctx.backendStatus.backendConnected, ctx.backendStatus.dbConnected)}
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