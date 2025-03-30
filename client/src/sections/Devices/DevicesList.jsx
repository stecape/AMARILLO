import { useState, useContext } from "react"
import { Button } from "@react-md/button"
import DeleteDevicePopup from "./DeleteDevicePopup"
import UpsertDevicePopup from "./UpsertDevicePopup"
import { DeleteFontIcon, EditFontIcon, AddFontIcon } from "@react-md/material-icons"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableContainer
} from '@react-md/table'
import axios from 'axios'
import {ctxData} from "../../Helpers/CtxProvider"
import tableStyles from '../../styles/Table.module.scss'

function DevicesList () {
  // Usa la variabile d'ambiente per configurare l'URL del server
  const serverIp = process.env.REACT_APP_SERVER_IP || "http://localhost:3001"
  const ctx = useContext(ctxData)
  const [deletePopup, setDeletePopup] = useState({ visible: false, id: 0, name: '' })
  const [modifyDevicePopup, setModifyDevicePopup] = useState({ visible: false, id: 0, name: '' })
  const [createDevicePopup, setCreateDevicePopup] = useState({ visible: false })
  

  return(
    <>
      <TableContainer>
        <Table fullWidth className={tableStyles.table}>
          <TableHeader>
            <TableRow>
              <TableCell hAlign="left" grow >Name</TableCell>
              <TableCell hAlign="center">UTC offset</TableCell>
              <TableCell hAlign="center">Status</TableCell>
              <TableCell hAlign="center">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ctx.devices.map((item) => {
                return (
                  <TableRow
                    key={item.id}
                  >
                    <TableCell className={tableStyles.cell} hAlign="left">{item.name}</TableCell>
                    <TableCell className={tableStyles.cell} hAlign="center">{item.utc_offset}</TableCell>
                    <TableCell className={tableStyles.cell} hAlign="center">{item.status === 0 || item.status == null ? "Offline" : "Online"}</TableCell>
                    <TableCell className={tableStyles.cell}>
                      <Button
                        buttonType="icon"
                        theme="error"
                        aria-label="Permanently Delete"
                        onClick={()=> setDeletePopup({visible: true, id: item.id, name: item.name})}
                      >
                        <DeleteFontIcon />
                      </Button>
                      <Button
                        buttonType="icon"
                        aria-label="Edit"
                        onClick={()=> setModifyDevicePopup({visible: true, id: item.id, name: item.name})}
                      >
                        <EditFontIcon />
                      </Button>
                  </TableCell>
                  <TableCell />
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <Button floating="bottom-right" onClick={()=> setCreateDevicePopup({visible: true})}><AddFontIcon /></Button>
      
      <DeleteDevicePopup 
        visible={deletePopup.visible}
        name={deletePopup.name}
        delDevice={()=>{
          axios.post(`${serverIp}/api/removeDevice`, {id: deletePopup.id})
            .then(setDeletePopup((prevState) => ({ ...prevState, visible: false })))
        }}
        cancelCommand={()=>{
          setDeletePopup((prevState) => ({ ...prevState, visible: false }))
        }}
      />
      <UpsertDevicePopup 
        visible={modifyDevicePopup.visible}
        name={modifyDevicePopup.name}
        modalType="full-page"
        upsertDevice={(data)=>{
          axios.post(`${serverIp}/api/modifyDevice`, {...data, id: modifyDevicePopup.id})
            .then(setModifyDevicePopup((prevState) => ({ ...prevState, visible: false })))
        }}
        cancelCommand={()=>{
          setModifyDevicePopup((prevState) => ({ ...prevState, visible: false }))
        }}
      />
      <UpsertDevicePopup 
        visible={createDevicePopup.visible}
        create
        name=""
        modalType="full-page"
        upsertDevice={(data)=>{
          axios.post(`${serverIp}/api/addDevice`, data)
            .then(setCreateDevicePopup((prevState) => ({ ...prevState, visible: false })))
        }}
        cancelCommand={()=>{
          setCreateDevicePopup((prevState) => ({ ...prevState, visible: false }))
        }}
      />
    </>
  )}
export default DevicesList