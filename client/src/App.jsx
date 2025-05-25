import { Route, Routes } from "react-router-dom"
import { NestedDialogContextProvider } from "@react-md/dialog"
import Home from "./sections/Home/Home"
import Types from "./sections/Types/Types"
import Um from "./sections/Um/Um"
import LogicState from "./sections/LogicState/LogicState"
import Templates from "./sections/Templates/Templates"
import Devices from "./sections/Devices/Devices"
import Alarms from "./sections/Alarms/Alarms"
import Tags from "./sections/Tags/Tags"
import Controls from "./sections/Controls/Controls"
import NoPage from "./sections/NoPage/NoPage"
import Trend from "./sections/Trend/Trend"
import Oven from "./sections/Oven/Oven"

function App () {
  return (
  <>
    <NestedDialogContextProvider>
      <Routes>
        <Route index element={<Home />} />
        <Route path="types" element={<Types/>} />
        <Route path="um" element={<Um/>} />
        <Route path="logicState" element={<LogicState/>} />
        <Route path="templates" element={<Templates/>} />
        <Route path="devices" element={<Devices/>} />
        <Route path="alarms" element={<Alarms/>} />
        <Route path="tags" element={<Tags/>} />
        <Route path="controls" element={<Controls/>} />
        <Route path="trend" element={<Trend/>} />
        <Route path="/oven" element={<Oven />} />
        <Route path="*" element={<NoPage />} />
      </Routes>
    </NestedDialogContextProvider>
  </>
)}
export default App
