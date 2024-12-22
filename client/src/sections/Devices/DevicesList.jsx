import { useState, useContext } from "react"
import { Button } from "@react-md/button"
import DeleteDevicePopup from "./DeleteDevicePopup"
import UpsertDevicePopup from "./UpsertDevicePopup"
import { DeleteSVGIcon, EditSVGIcon, AddSVGIcon } from "@react-md/material-icons"
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
                    <TableCell className={tableStyles.cell}>
                      <Button
                        buttonType="icon"
                        theme="error"
                        aria-label="Permanently Delete"
                        onClick={()=> setDeletePopup({visible: true, id: item.id, name: item.name})}
                      >
                        <DeleteSVGIcon />
                      </Button>
                      <Button
                        buttonType="icon"
                        aria-label="Edit"
                        onClick={()=> setModifyDevicePopup({visible: true, id: item.id, name: item.name})}
                      >
                        <EditSVGIcon />
                      </Button>
                  </TableCell>
                  <TableCell />
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <Button floating="bottom-right" onClick={()=> setCreateDevicePopup({visible: true})}><AddSVGIcon /></Button>
      
      <DeleteDevicePopup 
        visible={deletePopup.visible}
        name={deletePopup.name}
        delVar={()=>{
          axios.post('http://localhost:3001/api/removeDevice', {id: deletePopup.id})
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
          axios.post('http://localhost:3001/api/modifyDevice', {...data, id: modifyDevicePopup.id})
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
          axios.post('http://localhost:3001/api/addDevice', data)
            .then(setCreateDevicePopup((prevState) => ({ ...prevState, visible: false })))
        }}
        cancelCommand={()=>{
          setCreateDevicePopup((prevState) => ({ ...prevState, visible: false }))
        }}
      />
    </>
  )}
export default DevicesList