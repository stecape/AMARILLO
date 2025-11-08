import { useState, useEffect, useContext } from "react"
import { AppBar, AppBarTitle, AppBarNav } from '@react-md/app-bar'
import { Grid, GridCell } from '@react-md/utils'
import { Dialog, DialogContent } from "@react-md/dialog"
import { ArrowBackFontIcon } from '@react-md/material-icons'
import FieldsList from './UpsertType/FieldsList'
import NewField from './UpsertType/NewField'
import TypeName from './UpsertType/TypeName'
import QueryList from './UpsertType/QueryList'
import gridStyles from '../../styles/Grid.module.scss'
import formStyles from '../../styles/Form.module.scss'
import axios from 'axios'
import { UpsertTypeContext } from './UpsertType/UpsertTypeContext'
import { getApiUrl } from '../../Helpers/config';

function UpsertTypePopup (props) {
  // Usa la variabile d'ambiente per configurare l'URL del server
  const serverIp = getApiUrl()
  const {upsertType, setUpsertType} = useContext(UpsertTypeContext)
  const [modalState, setModalState] = useState({ visible: false, modalType: props.modalType })
  const _upsertType = () => {
    return new Promise((innerResolve, innerReject) => {
      
      axios.post(`${serverIp}/api/deleteTags`)
      .then(() => {
        
        var query = `DO $$ 
          DECLARE
            typeId "Type".id%TYPE;
          BEGIN
            `
            +
            upsertType.typeNameQuery
            +
            `
            `
            +
            upsertType.insertQuery.map(q => q.query).join(`
            `)
            +
            upsertType.updateQuery.map(q => q.query).join(`
            `)
            +
            upsertType.deleteQuery.map(q => q.query).join(`
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
    setUpsertType((prevState) => ({...prevState, name: '', fields: []}))
  }

  useEffect(() => {
    setModalState((prevState) => ({ ...prevState, visible: props.visible}))    
  },[props.visible])
  
  return (
    <Dialog
      id="create-type-dialog"
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
      <AppBarTitle>{"Creating Type"}</AppBarTitle>
    </AppBar>
      <DialogContent>
        <div className={formStyles.container}>
          <Grid>
            <GridCell colSpan={12} className={gridStyles.item}>
              <TypeName
                reset={handleReset}
                upsertType={_upsertType}
              />
            </GridCell>
            <GridCell colSpan={12} className={gridStyles.item}>
              <NewField />
            </GridCell>
            <GridCell colSpan={12} className={gridStyles.item}>
              <FieldsList />
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
export default UpsertTypePopup
