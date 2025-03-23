import { useState, useContext } from "react"
import { Button } from "@react-md/button"
import DeleteTemplatePopup from "./DeleteTemplatePopup"
import UpsertTemplatePopup from "./UpsertTemplatePopup"
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

function TemplatesList () {
  // Usa la variabile d'ambiente per configurare l'URL del server
  const serverIp = process.env.REACT_APP_SERVER_IP || "http://localhost:3001"
  const ctx = useContext(ctxData)
  const [deletePopup, setDeletePopup] = useState({ visible: false, id: 0, name: '' })
  const [modifyTemplatePopup, setModifyTemplatePopup] = useState({ visible: false, id: 0, name: '' })
  const [createTemplatePopup, setCreateTemplatePopup] = useState({ visible: false })

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
                        <DeleteFontIcon />
                      </Button>
                      <Button
                        buttonType="icon"
                        aria-label="Edit"
                        onClick={()=> setModifyTemplatePopup({visible: true, id: item.id, name: item.name})}
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
      <Button floating="bottom-right" onClick={()=> setCreateTemplatePopup({visible: true})}><AddFontIcon /></Button>
      
      <DeleteTemplatePopup 
        visible={deletePopup.visible}
        name={deletePopup.name}
        delTemplate={()=>{
          axios.post(`${serverIp}/api/removeTemplate`, {id: deletePopup.id})
            .then(setDeletePopup((prevState) => ({ ...prevState, visible: false })))
        }}
        cancelCommand={()=>{
          setDeletePopup((prevState) => ({ ...prevState, visible: false }))
        }}
      />
      <UpsertTemplatePopup 
        visible={modifyTemplatePopup.visible}
        name={modifyTemplatePopup.name}
        modalType="full-page"
        upsertTemplate={(data)=>{
          axios.post(`${serverIp}/api/modifyTemplate`, {...data, id: modifyTemplatePopup.id})
            .then(setModifyTemplatePopup((prevState) => ({ ...prevState, visible: false })))
        }}
        cancelCommand={()=>{
          setModifyTemplatePopup((prevState) => ({ ...prevState, visible: false }))
        }}
      />
      <UpsertTemplatePopup 
        visible={createTemplatePopup.visible}
        create
        name=""
        modalType="full-page"
        upsertTemplate={(data)=>{
          axios.post(`${serverIp}/api/addTemplate`, data)
            .then(setCreateTemplatePopup((prevState) => ({ ...prevState, visible: false })))
        }}
        cancelCommand={()=>{
          setCreateTemplatePopup((prevState) => ({ ...prevState, visible: false }))
        }}
      />
    </>
  )}
export default TemplatesList