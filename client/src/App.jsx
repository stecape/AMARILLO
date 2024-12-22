import { Route, Routes } from "react-router-dom"
import { NestedDialogContextProvider } from "@react-md/dialog"
import Home from "./sections/Home/Home"
import Types from "./sections/Types/Types"
import Um from "./sections/Um/Um"
import LogicState from "./sections/LogicState/LogicState"
import Devices from "./sections/Devices/Devices"
import Vars from "./sections/Vars/Vars"
import Alarms from "./sections/Alarms/Alarms"
import Tags from "./sections/Tags/Tags"
import NoPage from "./sections/NoPage/NoPage"

function App () {
  return (
  <>
    <NestedDialogContextProvider>
      <Routes>
        <Route index element={<Home />} />
        <Route path="types" element={<Types/>} />
        <Route path="um" element={<Um/>} />
        <Route path="logicState" element={<LogicState/>} />
        <Route path="devices" element={<Devices/>} />
        <Route path="vars" element={<Vars/>} />
        <Route path="alarms" element={<Alarms/>} />
        <Route path="tags" element={<Tags/>} />
        <Route path="*" element={<NoPage />} />
      </Routes>
    </NestedDialogContextProvider>
  </>
)}
export default App
