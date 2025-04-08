import { useState, useContext } from "react"
import { useAddMessage } from "@react-md/alert"
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
import { UpsertTemplateContext } from "./UpsertTemplate/UpsertTemplateContext";
import tableStyles from '../../styles/Table.module.scss'

function TemplatesList () {
  // Usa la variabile d'ambiente per configurare l'URL del server
  const serverIp = process.env.REACT_APP_SERVER_IP || "http://localhost:3001"
  const ctx = useContext(ctxData)
  const addMessage = useAddMessage()
  const [deletePopup, setDeletePopup] = useState({ visible: false, id: 0, name: '' })
  const [upsertTemplatePopup, setUpsertTemplatePopup] = useState({ visible: false })
  const {setUpsertTemplate, initUpsertTemplateContext} = useContext(UpsertTemplateContext)

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
            {ctx.templates.map((item) => {
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
                      disabled={item.locked}
                      onClick={()=> 
                        //the edit button of each template make an async call to the API, which, given the template Id, it retreives:
                        // - the template name
                        // - the template id
                        // - the template's vars list
                        //and then it configures the context:
                        //the query list is cleared,
                        //the name of the template to edit is initialized, and so it is the template Id and the relative vars.
                        axios.post(`${serverIp}/api/getVars`, {template: item.id})
                        .then((res) => {
                          console.log(res)
                          setUpsertTemplate(() => ({
                            create: false,
                            templateNameQuery: `UPDATE "Template" SET name='${res.data.result.name}' WHERE id = ${res.data.result.template} RETURNING id INTO templateId;`,
                            insertQuery:[],
                            updateQuery:[],
                            deleteQuery:[],
                            name: res.data.result.name,
                            template: res.data.result.template,
                            vars: res.data.result.vars,
                          }), setUpsertTemplatePopup((prevState) => ({ ...prevState, visible: true })))  //as callback, tt shows the popup                         
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
          initUpsertTemplateContext(ctx.templates)
          setUpsertTemplatePopup((prevState) => ({ ...prevState, visible: true }))  //it shows the popup
        }}
      >
        <AddFontIcon />
      </Button>

      <DeleteTemplatePopup 
        visible={deletePopup.visible}
        name={deletePopup.name}
        delTemplate={()=>{
          axios.post(`${serverIp}/api/removeTemplate`, {id: deletePopup.id})
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
      <UpsertTemplatePopup
        visible={upsertTemplatePopup.visible}
        name=""
        modalType="full-page"
        typesList={ctx.templates}
        cancelCommand={()=>{
          setUpsertTemplatePopup((prevState) => ({ ...prevState, visible: false }))
        }}
      />
    </>
  )}
export default TemplatesList