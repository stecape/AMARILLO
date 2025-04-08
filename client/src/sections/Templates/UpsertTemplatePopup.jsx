import { useState, useEffect, useContext } from "react"
import { AppBar, AppBarTitle, AppBarNav } from '@react-md/app-bar'
import { Grid, GridCell } from '@react-md/utils'
import { Dialog, DialogContent } from "@react-md/dialog"
import { ArrowBackFontIcon } from '@react-md/material-icons'
import VarsList from './UpsertTemplate/VarsList'
import NewVar from './UpsertTemplate/NewVar'
import TemplateName from './UpsertTemplate/TemplateName'
import QueryList from './UpsertTemplate/QueryList'
import gridStyles from '../../styles/Grid.module.scss'
import formStyles from '../../styles/Form.module.scss'
import axios from 'axios'
import { UpsertTemplateContext } from './UpsertTemplate/UpsertTemplateContext'

function UpsertTemplatePopup (props) {
  // Usa la variabile d'ambiente per configurare l'URL del server
  const serverIp = process.env.REACT_APP_SERVER_IP || "http://localhost:3001"
  const {upsertTemplate, setUpsertTemplate} = useContext(UpsertTemplateContext)
  const [modalState, setModalState] = useState({ visible: false, modalType: props.modalType })
  const _upsertTemplate = () => {
    return new Promise((innerResolve, innerReject) => {
      
      axios.post(`${serverIp}/api/deleteTags`)
      .then(() => {
        
        var query = `DO $$ 
          DECLARE
            templateId "Template".id%TYPE;
          BEGIN
            `
            +
            upsertTemplate.templateNameQuery
            +
            `
            `
            +
            upsertTemplate.insertQuery.map(q => q.query).join(`
            `)
            +
            upsertTemplate.updateQuery.map(q => q.query).join(`
            `)
            +
            upsertTemplate.deleteQuery.map(q => q.query).join(`
            `)
            +
            `
          END $$`
        console.log(query)
        axios.post(`${serverIp}/api/exec`, {query: query})
        .then(()=>{
          axios.post(`${serverIp}/api/refreshTags`)
          .then(() => {
            innerResolve()
          })
          .catch((error)=>{
            console.log("error during refresh tags", error)
            innerReject(error)
          })
        })
        .catch((error)=>{innerReject(error)})
      })
      .catch((error)=>{innerReject(error)})
    })
  }

  const handleReset = () => {
    props.cancelCommand()
    setUpsertTemplate((prevState) => ({...prevState, name: '', vars: []}))
  }

  useEffect(() => {
    setModalState((prevState) => ({ ...prevState, visible: props.visible}))    
  },[props.visible])
  
  return (
    <Dialog
      id="create-template-dialog"
      role="alertdialog"
      type={modalState.modalType}
      visible={modalState.visible}
      onRequestClose={handleReset}
      aria-labelledby="dialog-title"
    >
    <AppBar id={`appbarT`} theme="primary" key="primary">
      <AppBarNav onClick={handleReset} aria-label="Close">
        <ArrowBackFontIcon />
      </AppBarNav>
      <AppBarTitle>{"Creating Template"}</AppBarTitle>
    </AppBar>
      <DialogContent>
        <div className={formStyles.container}>
          <Grid>
            <GridCell colSpan={12} className={gridStyles.item}>
              <TemplateName
                reset={handleReset}
                upsertTemplate={_upsertTemplate}
              />
            </GridCell>
            <GridCell colSpan={12} className={gridStyles.item}>
              <NewVar />
            </GridCell>
            <GridCell colSpan={12} className={gridStyles.item}>
              <VarsList />
            </GridCell>
            <GridCell colSpan={12} className={gridStyles.item}>
              <QueryList />
            </GridCell>
          </Grid>
        </div>
      </DialogContent>      
    </Dialog>
  )
}
export default UpsertTemplatePopup