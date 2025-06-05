import { useState, useEffect, useContext } from "react"
import { Button } from "@react-md/button"
import { Dialog, DialogContent, DialogFooter } from "@react-md/dialog"
import { Typography } from "@react-md/typography"
import {
  Form,
  TextField,
  FormThemeProvider,
  Select
} from '@react-md/form'
import {ctxData} from "../../../Helpers/CtxProvider"

function ModifyFieldPopup (props) {
  const ctx = useContext(ctxData)
  const [modalState, setModalState] = useState({ visible: false, name: '', type: 0, um: 0, logic_state: 0, comment: '', fieldNameNotValid: false })

  //Input Validation
  const InlineValidation = (value) => {
    let pattern = /[^A-Za-z0-9\-_<> ]/g
    setModalState((prevState) => ({ ...prevState, name: value, fieldNameNotValid: pattern.test(value) || props.fields.find(i => i.name === value && i.QRef !== props.QRef) || value === ''}))
  }
  
  //Form Events
  const handleSubmit = (event) => {
    event.preventDefault()
    props.updField({name: modalState.name, type: modalState.type, um: modalState.um, logic_state: modalState.logic_state, comment: modalState.comment})
  }
  const handleReset = (event) => {
    event.preventDefault()
    props.cancelCommand()
  }

  useEffect(() => {
    setModalState((prevState) => ({ ...prevState, name: props.name, type: props.type, um: props.um, logic_state: props.logic_state, comment: props.comment, visible: props.visible}))
  },[props.name, props.visible, props.type, props.um, props.logic_state, props.comment])
  
  return (
    <Dialog
      id="modify-field-dialog"
      role="alertdialog"
      modal={modalState.modal}
      visible={modalState.visible}
      onRequestClose={props.cancelCommand}
      aria-labelledby="dialog-title"
    >
      <FormThemeProvider theme='outline'>
        <Form onSubmit={handleSubmit} onReset={handleReset}>
          <DialogContent>
            <Typography
              id="dialog-title"
              type="subtitle-1"
              margin="none"
              color="secondary"
            >
              Modifying {modalState.name}:
            </Typography>
            <TextField
              id='name'
              key='name'
              type='string'
              label="Field Name"
              value={modalState.name}
              onChange={(e) => InlineValidation(e.target.value)}
              error={modalState.fieldNameNotValid}
            />
            <Select
              id='type'
              key='type'
              options={props.typesList.map((item) => ({
                label: item.name,
                value: item.id
              }))}
              value={modalState.type.toString()}
              label="Type"
              onChange={(value) => setModalState((prevState) => ({ ...prevState, type: Number(value)}))}
            />
            <Select
              id='um'
              key='um'
              options={ctx.ums.map((item) => ({
                label: item.name,
                value: item.id
              }))}
              value={modalState.um !== null && modalState.um.toString()}
              label="um"
              onChange={(value) => setModalState((prevState) => ({ ...prevState, um: Number(value)}))}
            />
            <Select
              id='logic_state'
              key='logic_state'
              options={ctx.logicStates.map((item) => ({
                label: item.name,
                value: item.id
              }))}
              value={modalState.logic_state !== null && modalState.logic_state.toString()}
              label="Logic State"
              onChange={(value) => setModalState((prevState) => ({ ...prevState, logic_state: Number(value)}))}
            />
            <TextField
              id='comment'
              key='comment'
              type='string'
              label="comment"
              value={modalState.comment}
              onChange={(e) => setModalState((prevState) => ({ ...prevState, comment: e.target.value}))}
            />
          </DialogContent>
          <DialogFooter>
            <Button
              type="reset"
              id="dialog-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              id="dialog-modify"
              theme="primary"
              disabled={modalState.fieldNameNotValid || modalState.name.length === 0}
            >
              Save
            </Button>
          </DialogFooter>
        </Form>
      </FormThemeProvider>
    </Dialog>
  )
}
export default ModifyFieldPopup