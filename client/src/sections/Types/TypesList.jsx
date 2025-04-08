import { useState, useContext } from "react"
import { useAddMessage } from "@react-md/alert"
import { Button } from "@react-md/button"
import DeleteTypePopup from "./DeleteTypePopup"
import UpsertTypePopup from "./UpsertTypePopup"
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
import { UpsertTypeContext } from "./UpsertType/UpsertTypeContext";
import tableStyles from '../../styles/Table.module.scss'

function TypesList () {
  // Usa la variabile d'ambiente per configurare l'URL del server
  const serverIp = process.env.REACT_APP_SERVER_IP || "http://localhost:3001"
  const ctx = useContext(ctxData)
  const addMessage = useAddMessage()
  const [deletePopup, setDeletePopup] = useState({ visible: false, id: 0, name: '' })
  const [upsertTypePopup, setUpsertTypePopup] = useState({ visible: false })
  const {setUpsertType, initUpsertTypeContext} = useContext(UpsertTypeContext)

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
            {ctx.types.map((item) => {
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
                      disabled={item.locked}
                    >
                      <DeleteFontIcon />
                    </Button>
                    <Button
                      buttonType="icon"
                      aria-label="Edit"
                      disabled={item.locked}
                      onClick={()=> 
                        //the edit button of each type make an async call to the API, which, given the type Id, it retreives:
                        // - the type name
                        // - the type id
                        // - the type's fields list
                        // - the list of the types that includes the type in theyr dependencies
                        //   (we must avoid that one of these types could be included in the type that we are modifying, otherwise we would generate a circular dependency) 
                        //and then it configures the context:
                        //the query list is cleared,
                        //the name of the type to edit is initialized, and so it is the type Id and the relative fields.
                        //The context is populated also with the types list which is populated with the types that are not included in the dependencies array, 
                        //to avoid circular references
                        axios.post(`${serverIp}/api/getFields`, {type: item.id})
                        .then((res) => {
                          console.log(res)
                          setUpsertType(() => ({
                            create: false,
                            typeNameQuery: `UPDATE "Type" SET name='${res.data.result.name}' WHERE id = ${res.data.result.type} RETURNING id INTO typeId;`,
                            insertQuery:[],
                            updateQuery:[],
                            deleteQuery:[],
                            name: res.data.result.name,
                            type: res.data.result.type,
                            fields: res.data.result.fields,
                            typesList: ctx.types.filter(i => !res.data.result.deps.includes(i.id) ),
                          }), setUpsertTypePopup((prevState) => ({ ...prevState, visible: true })))  //as callback, tt shows the popup                         
                        })
                      }
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
      <Button 
        floating="bottom-right" 
        onClick={() => {
          initUpsertTypeContext(ctx.types)
          setUpsertTypePopup((prevState) => ({ ...prevState, visible: true }))  //it shows the popup
        }}
      >
        <AddFontIcon />
      </Button>

      <DeleteTypePopup 
        visible={deletePopup.visible}
        name={deletePopup.name}
        delType={()=>{
          axios.post(`${serverIp}/api/removeType`, {id: deletePopup.id})
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
      <UpsertTypePopup
        visible={upsertTypePopup.visible}
        name=""
        modalType="full-page"
        typesList={ctx.types}
        cancelCommand={()=>{
          setUpsertTypePopup((prevState) => ({ ...prevState, visible: false }))
        }}
      />
    </>
  )}
export default TypesList