import { useState, useContext } from "react"
import { GridCell } from '@react-md/utils'
import { Typography } from "@react-md/typography"
import { Dialog, DialogContent, DialogFooter } from "@react-md/dialog"
import { Button } from "@react-md/button"
import { TextField } from "@react-md/form"
import styles from "./SetAct.module.scss"
import { ctxData } from "../../../Helpers/CtxProvider"
import axios from 'axios'
import Bar from "../Bar/Bar"
import SetPopup from "../SetPopup/SetPopup"
import { getApiUrl } from "../../../Helpers/config"


function SetAct(props) {
  // Usa la variabile d'ambiente per configurare l'URL del server
  const serverIp = getApiUrl()

  // Stato per gestire la visibilità del popup
  const [isDialogVisible, setDialogVisible] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const ctx = useContext(ctxData)

  // Controlla se ctx.controls esiste
  if (ctx.controls === undefined || Object.keys(ctx.controls).length === 0) {
    return null // Non renderizzare nulla se ctx.controls non esiste
  }

  // Recupera il nome del dispositivo
  const device = ctx.devices.find(d => d.id === props.ctrl.device)?.name || "Unknown Device"

  //this controls has 3 subcontrols: set, act and limit.
  //We need to retrieve the subcontrols to fully describe the component
  const setCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.Set)
  const actCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.Act)
  const limitCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.Limit)

  //Retrieving all the divice information from the control and the subcontrols
  const decimalsTag = ctx.tags.find(t => t.id === props.ctrl.fields.Decimals);
  const decimals = decimalsTag?.value?.value ?? 0; // Usa 0 come valore predefinito se Decimals è null
  const umTag = ctx.ums.find(um => um.id === props.ctrl.um)
  const um = umTag?.metric ?? "Unknown Unit" // Usa "Unknown Unit" come valore predefinito se non trovato
  const setTag = ctx.tags.find(t => t.id === setCtrl.fields.Value)
  const set = setTag?.value?.value ?? 0 // Usa 0 come valore predefinito se Set è null
  const actTag = ctx.tags.find(t => t.id === actCtrl.fields.HMIValue)
  const act = parseFloat(actTag?.value?.value?.toFixed(decimals) ?? 0)
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
      <GridCell colSpan={12} className={styles.setact} onClick={openDialog}>
        <Typography
          id="act-title"
          type="headline-6"
          margin="none"
          color="secondary"
          className={styles.title}
        >
          {device} - {props.ctrl.name}
        </Typography>
        <div className={styles.outputField}>
          <div className={styles.setField}>
            <Typography
              id="set-value"
              type="headline-5"
              margin="none"
              color="primary"
              className={styles.setValue}
            >
              {set}
            </Typography>
            <Typography
              id="set-unit"
              type="subtitle-2"
              margin="none"
              color="secondary"
              className={styles.setUnit}
            >
              {um}
            </Typography>
          </div>
          <div className={styles.actField}>
            <Typography
              id="act-value"
              type="headline-5"
              margin="none"
              color="primary"
              className={styles.actValue}
            >
              {act}
            </Typography>
            <Typography
              id="act-unit"
              type="subtitle-2"
              margin="none"
              color="secondary"
              className={styles.actUnit}
            >
              {um}
            </Typography>
          </div>
        </div>
        <Bar set={set} act={act} max={max} min={min}/>
      </GridCell>

      {/* Popup dialog */}
      <Dialog
        id="set-dialog"
        visible={isDialogVisible}
        onRequestClose={closeDialog}
        aria-labelledby="set-dialog-title"
      >
        <DialogContent>
          <Typography id="set-dialog-title" type="headline-6" margin="none">
            {device} - {props.ctrl.name}
          </Typography>
          <TextField
            id="set-input"
            label="Set value"
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(Number(e.target.value) || 0)}
            min={min}
            max={max}
            className={styles.dialogInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                confirmValue(); // Conferma il valore quando viene premuto Enter
              }
            }}
          />
          <Bar set={inputValue} min={min} max={max} />
        </DialogContent>
        <DialogFooter>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={confirmValue} theme="primary">
            Set
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}

export default SetAct