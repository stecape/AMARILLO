import { useState, useContext } from "react"
import { useAddMessage } from "@react-md/alert"
import { Button } from "@react-md/button"
import DeleteUmPopup from "./DeleteUmPopup"
import UpsertUmPopup from "./UpsertUmPopup"
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

function UmList () {
  const ctx = useContext(ctxData)
  const addMessage = useAddMessage()
  const [deletePopup, setDeletePopup] = useState({ visible: false, id: 0, name: '' })
  const [modifyUmPopup, setModifyUmPopup] = useState({ visible: false, id: 0, name: '', metric: '', imperial: '', gain: 1.0, offset: 0.0})
  const [createUmPopup, setCreateUmPopup] = useState({ visible: false })

  return(
    <>
      <TableContainer>
        <Table fullWidth className={tableStyles.table}>
          <TableHeader>
            <TableRow>
              <TableCell hAlign="left" grow >Name</TableCell>
              <TableCell hAlign="center">Metric</TableCell>
              <TableCell hAlign="center">Imperial</TableCell>
              <TableCell hAlign="center">Gain</TableCell>
              <TableCell hAlign="center">Offset</TableCell>
              <TableCell hAlign="center">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ctx.ums.map((item) => {
                return (
                  <TableRow
                    key={item.id}
                  >
                    <TableCell className={tableStyles.cell} hAlign="left">{item.name}</TableCell>
                    <TableCell className={tableStyles.cell}>{item.metric}</TableCell>
                    <TableCell className={tableStyles.cell}>{item.imperial}</TableCell>
                    <TableCell className={tableStyles.cell}>{item.gain}</TableCell>
                    <TableCell className={tableStyles.cell}>{item.offset}</TableCell>
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
                        onClick={()=> setModifyUmPopup({visible: true, id: item.id, name: item.name, metric: item.metric, imperial: item.imperial, gain: item.gain, offset: item.offset})}
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
      <Button floating="bottom-right" onClick={()=> setCreateUmPopup({visible: true})}><AddFontIcon /></Button>
      
      <DeleteUmPopup 
        visible={deletePopup.visible}
        name={deletePopup.name}
        delUm={()=>{
          axios.post('http://localhost:3001/api/removeUm', {id: deletePopup.id})
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
      <UpsertUmPopup 
        visible={modifyUmPopup.visible}
        name={modifyUmPopup.name}
        metric={modifyUmPopup.metric}
        imperial={modifyUmPopup.imperial}
        gain={modifyUmPopup.gain}
        offset={modifyUmPopup.offset}
        modalType="full-page"
        upsertUm={(data)=>{
          axios.post('http://localhost:3001/api/modifyUm', {...data, id: modifyUmPopup.id})
            .then(setModifyUmPopup((prevState) => ({ ...prevState, visible: false })))
        }}
        cancelCommand={()=>{
          setModifyUmPopup((prevState) => ({ ...prevState, visible: false }))
        }}
      />
      <UpsertUmPopup 
        visible={createUmPopup.visible}
        create
        name=""
        metric=""
        imperial=""
        gain={1.0}
        offset={0.0}
        modalType="full-page"
        upsertUm={(data)=>{
          axios.post('http://localhost:3001/api/addUm', data)
            .then(setCreateUmPopup((prevState) => ({ ...prevState, visible: false })))
        }}
        cancelCommand={()=>{
          setCreateUmPopup((prevState) => ({ ...prevState, visible: false }))
        }}
      />
    </>
  )}
export default UmList