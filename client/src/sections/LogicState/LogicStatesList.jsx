import { useState, useContext } from "react"
import { useAddMessage } from "@react-md/alert"
import { Button } from "@react-md/button"
import DeleteLogicStatePopup from "./DeleteLogicStatePopup"
import UpsertLogicStatePopup from "./UpsertLogicStatePopup"
import { DeleteFontIcon, EditFontIcon, AddFontIcon } from "@react-md/material-icons"
import { getApiUrl } from '../../Helpers/config'
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

function LogicStatesList () {
  // Usa la variabile d'ambiente per configurare l'URL del server
  const serverIp = getApiUrl()
  const ctx = useContext(ctxData)
  const addMessage = useAddMessage()
  const [deletePopup, setDeletePopup] = useState({ visible: false, id: 0, name: '' })
  const [modifyLogicStatePopup, setModifyLogicStatePopup] = useState({ visible: false, id: 0, name: '', value: []})
  const [createLogicStatePopup, setCreateLogicStatePopup] = useState({ visible: false })

  return(
    <>
      <TableContainer>
        <Table fullWidth className={tableStyles.table}>
          <TableHeader>
            <TableRow>
              <TableCell hAlign="left" grow >Name</TableCell>
              <TableCell hAlign="center">Value</TableCell>
              <TableCell hAlign="center">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ctx.logicStates.map((item) => {
                return (
                  <TableRow
                    key={item.id}
                  >
                    <TableCell className={tableStyles.cell} hAlign="left">{item.name}</TableCell>
                    <TableCell className={tableStyles.cell}>{item.value.map(i => i!=="" && `'${i}' `)}</TableCell>
                    <TableCell className={tableStyles.cell}>
                      <Button
                        id="icon-button-4"
                        buttonType="icon"
                        theme="error"
                        aria-label="Permanently Delete"
                        onClick={()=> setDeletePopup({visible: true, id: item.id, name: item.name})}
                      >
                        <DeleteFontIcon />
                      </Button>
                      <Button
                        id="icon-button-4"
                        buttonType="icon"
                        aria-label="Edit"
                        onClick={()=> setModifyLogicStatePopup({visible: true, id: item.id, name: item.name, value: item.value})}
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
      <Button floating="bottom-right" onClick={()=> setCreateLogicStatePopup({visible: true})}><AddFontIcon /></Button>
      
      <DeleteLogicStatePopup 
        visible={deletePopup.visible}
        name={deletePopup.name}
        delLogicState={()=>{
          axios.post(`${serverIp}/api/removeLogicState`, {id: deletePopup.id})
            .then(response => {
              addMessage({children: response.data.message})
            })
            .catch(error => {
              if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                addMessage({children: "Error: " + error.response.data.message, messageId: Date.now().toString()})
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
              } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                addMessage({children: "Error: database not reachable"})
                console.log(error.request);
              } else {
                // Something happened in setting up the request that triggered an Error
                addMessage({children: "Error: wrong request parameters"})
                console.log('Error', error.message);
              }
              console.log(error.config);
            })
            .finally(()=>setDeletePopup((prevState) => ({ ...prevState, visible: false })))
        }}
        cancelCommand={()=>{
          setDeletePopup((prevState) => ({ ...prevState, visible: false }))
        }}
      />
      <UpsertLogicStatePopup 
        visible={modifyLogicStatePopup.visible}
        name={modifyLogicStatePopup.name}
        value={modifyLogicStatePopup.value}
        modalType="full-page"
        upsertLogicState={(data)=>{
          axios.post(`${serverIp}/api/modifyLogicState`, {...data, id: modifyLogicStatePopup.id})
            .then(setModifyLogicStatePopup((prevState) => ({ ...prevState, visible: false, value: Array(8).fill("")  })))
        }}
        cancelCommand={()=>{
          setModifyLogicStatePopup((prevState) => ({ ...prevState, visible: false, value: Array(8).fill("")  }))
        }}
      />
      <UpsertLogicStatePopup 
        visible={createLogicStatePopup.visible}
        create
        name=""
        value={Array(8).fill("")}
        modalType="full-page"
        upsertLogicState={(data)=>{
          axios.post(`${serverIp}/api/addLogicState`, data)
            .then(setCreateLogicStatePopup((prevState) => ({ ...prevState, visible: false, value: Array(8).fill("") })))
        }}
        cancelCommand={()=>{
          setCreateLogicStatePopup((prevState) => ({ ...prevState, visible: false }))
        }}
      />
    </>
  )}
export default LogicStatesList
