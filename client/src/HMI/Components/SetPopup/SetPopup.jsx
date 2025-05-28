import { useState, useEffect } from "react"
import Bar from "../Bar/Bar"
import { Typography } from "@react-md/typography"
import { Dialog, DialogContent, DialogFooter } from "@react-md/dialog"
import { Button } from "@react-md/button"
import { TextField } from "@react-md/form"
import styles from "./SetPopup.module.scss"

export default function SetPopup(props) {
  const [isDialogVisible, setDialogVisible] = useState(props.isDialogVisible ?? false)
  useEffect(() => {
    setDialogVisible(props.isDialogVisible)
  }, [props.isDialogVisible])

  const closeDialog = () => {
    setDialogVisible(false)
    if (props.closeDialog) props.closeDialog()
  }

  const confirmValue = () => {
    if (props.confirmValue) props.confirmValue()
    setDialogVisible(false)
  }

  return (
    <Dialog
      id="set-dialog"
      visible={isDialogVisible}
      onRequestClose={closeDialog}
      aria-labelledby="set-dialog-title"
    >
      <DialogContent>
        <Typography id="set-dialog-title" type="headline-6" margin="none">
          {props.device} - {props.ctrlName}
        </Typography>
        <TextField
          id="set-input"
          label="Set value"
          type="number"
          value={props.inputValue}
          onChange={(e) => props.setInputValue(Number(e.target.value) || 0)}
          min={props.min}
          max={props.max}
          className={styles.dialogInput}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              confirmValue();
            }
          }}
        />
        <Bar set={props.inputValue} min={props.min} max={props.max} />
      </DialogContent>
      <DialogFooter>
        <Button onClick={closeDialog}>Cancel</Button>
        <Button onClick={confirmValue} theme="primary">
          Set
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
