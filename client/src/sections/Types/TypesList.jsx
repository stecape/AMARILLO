import { useState, useEffect, createContext } from "react"
import { useAddMessage } from "@react-md/alert"
import { Button } from "@react-md/button"
import DeleteTypePopup from "./DeleteTypePopup"
import CreateTypePopup from "./CreateTypePopup"
import ModifyTypePopup from "./ModifyTypePopup"
import { DeleteSVGIcon, EditSVGIcon, AddSVGIcon } from "@react-md/material-icons"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@react-md/table'
import axios from 'axios'
import tableStyles from '../../styles/Table.module.scss'

export const ModifyTypeContext = createContext()

function TypesList (props) {
  const addMessage = useAddMessage()
  const [editType, setEditType] = useState({query:[]})
  const [typesList, setTypesList] = useState(props.typesList)
  const [deletePopup, setDeletePopup] = useState({ visible: false, id: 0, name: '' })
  const [modifyTypePopup, setModifyTypePopup] = useState({ visible: false, type: 0, name: '', deps: [] })
  const [createTypePopup, setCreateTypePopup] = useState({ visible: false})
  useEffect(() => {
    setTypesList(props.typesList)
  }, [props.typesList, addMessage])

  return(
    <>
      <Table fullWidth className={tableStyles.table}>
        <TableHeader>
          <TableRow>
            <TableCell hAlign="left" grow >Name</TableCell>
            <TableCell hAlign="center">Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {typesList.map((item) => {
              return (
                <TableRow
                  key={item.id}
                >
                  <TableCell className={tableStyles.cell} hAlign="left">{item.name}</TableCell>
                  <TableCell className={tableStyles.cell}>
                    <Button
                      id="icon-button-4"
                      buttonType="icon"
                      theme="error"
                      aria-label="Permanently Delete"
                      onClick={()=> setDeletePopup({visible: true, id: item.id, name: item.name})}
                    >
                      <DeleteSVGIcon />
                    </Button>
                    <Button
                      id="icon-button-4"
                      buttonType="icon"
                      aria-label="Edit"
                      onClick={()=> 
                        axios.post('http://localhost:3001/api/removeAll', {table: "NewTypeTmp"})
                        .then(
                          axios.post('http://localhost:3001/api/getFields', {type: item.id})
                          .then((res) => {
                            //////////////////////////////////////////////////////////////////////////////////////////77QUI SETTO IL CONTEXT E POI CONFIGURO IL POPUP
                            setEditType(() => ({
                              query: [],
                              name: res.data.result.name,
                              type: res.data.result.type,
                              fields: res.data.result.fields,
                              deps: res.data.result.deps
                            }))
                            setModifyTypePopup((prevState) => ({ ...prevState, visible: true }))
                          }))
                      }
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

      <Button 
        floating="bottom-right" 
        onClick={()=>
          axios.post('http://localhost:3001/api/removeAll', {table: "NewTypeTmp"})
          .then(setCreateTypePopup({visible: true}))}
      >
        <AddSVGIcon />
      </Button>

      <DeleteTypePopup 
        visible={deletePopup.visible}
        name={deletePopup.name}
        delType={()=>{
          axios.post('http://localhost:3001/api/removeType', {id: deletePopup.id})
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

      {/*
       * Modify Popup
       * Devo popolare la tabella con i fields,
       * Devo passare i Types,
       * Devo aggiornare il nome del Type
      */}
      
      <ModifyTypeContext.Provider value={{ editType, setEditType }}>
        <ModifyTypePopup
          visible={modifyTypePopup.visible}
          name={modifyTypePopup.name}
          type={modifyTypePopup.type}
          modalType="full-page"
          typesList={typesList.filter(i => !modifyTypePopup.deps.includes(i.id) )}
          cancelCommand={()=>{
            setModifyTypePopup((prevState) => ({ ...prevState, visible: false }))
            setEditType(() => ({
              query: [],
              name: "",
              type: "0",
              fields: []
            }))
          }}
        />
      </ModifyTypeContext.Provider>
      <CreateTypePopup
        visible={createTypePopup.visible}
        name=""
        modalType="full-page"
        typesList={typesList}
        cancelCommand={()=>{
          setCreateTypePopup((prevState) => ({ ...prevState, visible: false }))
        }}
      />
    </>
  )}
export default TypesList

/*
onClick={()=> 
  axios.post('http://localhost:3001/api/removeAll', {table: "NewTypeTmp"})//Qui devo prendere i field da l relativo type e riempire la tabella fields tmp
  .then(
    axios.post('http://localhost:3001/api/getFields', {type: item.id})
    .then((res) => axios.post(
      'http://localhost:3001/api/addMany', 
      {
        table: "NewTypeTmp",
        fields: ["name", "type", "id"],
        id: res.data.result[0],
        type: res.data.result.map(field => {return field.type}),
        name: res.data.result.map(field => {return field.name})
      })
      .then((res) => setModifyTypePopup({visible: true, id: item.id, name: item.name}))))
}
*/