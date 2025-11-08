import { useState, useContext } from "react"
import { GridCell } from '@react-md/utils'
import { Typography } from "@react-md/typography"
import styles from "./Set.module.scss"
import { ctxData } from "../../../Helpers/CtxProvider"
import axios from 'axios'
import Bar from "../Bar/Bar"
import SetPopup from "../SetPopup/SetPopup"
import { getApiUrl } from "../../../Helpers/config"


function Set(props) {
  // Usa la variabile d'ambiente per configurare l'URL del server
  const serverIp = getApiUrl()

  // Stato per gestire la visibilità del popup
  const [isDialogVisible, setDialogVisible] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const ctx = useContext(ctxData)
  
  // Controlla se ctx.controls esiste
  if (props.ctrl === undefined || ctx.controls === undefined || Object.keys(ctx.controls).length === 0) {
    return null // Non renderizzare nulla se ctx.controls non esiste
  }

  // Recupera il nome del dispositivo
  const device = ctx.devices.find(d => d.id === props.ctrl.device)?.name || "Unknown Device"

  //this controls has 2 subcontrols: set and limit.
  //We need to retrieve the subcontrols to fully describe the component
  const setCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.Set)
  const limitCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.Limit)

  //Retrieving all the divice information from the control and the subcontrols
  //const decimalsTag = ctx.tags.find(t => t.id === props.ctrl.fields.Decimals);
  //const decimals = decimalsTag?.value?.value ?? 0; // Usa 0 come valore predefinito se Decimals è null
  const umTag = ctx.ums.find(um => um.id === props.ctrl.um)
  const um = umTag?.metric ?? "Unknown Unit" // Usa "Unknown Unit" come valore predefinito se non trovato
  const setTag = ctx.tags.find(t => t.id === setCtrl.fields.Value)
  const set = setTag?.value?.value ?? 0 // Usa 0 come valore predefinito se Set è null
  const maxTag = ctx.tags.find(t => t.id === limitCtrl.fields.Max)
  const max = maxTag?.value?.value ?? 0 // Usa 0 come valore predefinito se Max è null
  const minTag = ctx.tags.find(t => t.id === limitCtrl.fields.Min)
  const min = minTag?.value?.value ?? 0 // Usa 0 come valore predefinito se Min è null

  // Funzione per aprire il popup
  const openDialog = () => {
    setInputValue(set) // Imposta il valore corrente come valore iniziale
    setDialogVisible(true)
  }

  // Funzione per chiudere il popup
  const closeDialog = () => {
    setDialogVisible(false)
  }

  // Funzione per confermare il nuovo valore
  const confirmValue = () => {
    axios.post(`${serverIp}/api/mqtt/write`, { device: device, id: setCtrl.fields.InputValue, value: inputValue })
    closeDialog()
  }

  return (
    <>
      <GridCell colSpan={12} className={styles.set} onClick={openDialog}>
        <Typography
          id="set-title"
          type="headline-6"
          margin="none"
          color="secondary"
          className={styles.title}
        >
          {device} - {props.ctrl.name}
        </Typography>
        <div className={styles.outputField}>
          <Typography
            id="set-value"
            type="headline-5"
            margin="none"
            color="primary"
            className={styles.value}
          >
            {set}
          </Typography>
          <Typography
            id="set-unit"
            type="subtitle-2"
            margin="none"
            color="secondary"
            className={styles.unit}
          >
            {um}
          </Typography>
        </div>
        <Bar set={set} min={min} max={max} />
      </GridCell>

      {/* Popup dialog */}
      <SetPopup
        isDialogVisible={isDialogVisible}
        confirmValue={confirmValue}
        closeDialog={closeDialog}
        inputValue={inputValue}
        setInputValue={setInputValue}
        min={min}
        max={max}
        device={device}
        ctrlName={props.ctrl.name}
      />
    </>
  )
}

export default Set