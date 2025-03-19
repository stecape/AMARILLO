import { useState, useEffect, useContext } from "react"
import { AppBar, AppBarTitle, AppBarNav } from '@react-md/app-bar';
import { Grid, GridCell } from '@react-md/utils'
import { Button } from "@react-md/button"
import { Dialog, DialogContent } from "@react-md/dialog"
import { ArrowBackFontIcon } from '@react-md/material-icons';
import {
  Form,
  TextField,
  FormThemeProvider,
  Select
} from '@react-md/form'
import {ctxData} from "../../Helpers/CtxProvider"
import gridStyles from '../../styles/Grid.module.scss'
import formStyles from '../../styles/Form.module.scss'

function UpsertVarPopup (props) {

  const ctx = useContext(ctxData)
  const [modalState, setModalState] = useState({ visible: false, varNameNotValid: true, device: 0, name: '', modalType: props.modalType, type: 0, um: 0, logic_state: 0, comment: '' })
  const [prevName, setPrevName] = useState("")

  //Input Validation
  const InlineValidation = (value) => {
    let pattern = /[^A-Za-z0-9_]|^[^A-Za-z_]/
    const isPatternInvalid = pattern.test(value)
    setModalState((prevState) => ({...prevState, name: value, varNameNotValid: isPatternInvalid || ctx.vars.find(i => i.name === value)}))
  }
  

  //Form Events
  const handleSubmit = (event) => {
    event.preventDefault()
    props.upsertVar({device:modalState.device, name:modalState.name, type: modalState.type, um: modalState.um === 0 ? null : modalState.um, logic_state: modalState.logic_state === 0 ? null : modalState.logic_state, comment: modalState.comment === '' ? '' : modalState.comment })
    setModalState((prevState) => ({ ...prevState, device: 0, name: "", type: 0, um: 0, logic_state: 0, comment: ''}))
  }
  const handleReset = () => {
    setModalState((prevState) => ({ ...prevState, device: 0, name: "", type: 0, um: 0, logic_state: 0, comment: ''}))
    props.cancelCommand()
  }

  useEffect(() => {
    setModalState((prevState) => ({ ...prevState, varNameNotValid: props.varNameNotValid, device: props.device, name: props.name, type: props.type, um: props.um, logic_state: props.logic_state, comment: props.comment, visible: props.visible}))
  },[props.device, props.name, props.visible, props.type, props.um, props.logic_state, props.comment, props.varNameNotValid])
  
  return (
    <Dialog
      id="upsert-var-dialog"
      role="alertdialog"
      type={modalState.modalType}
      visible={modalState.visible}
      onRequestClose={props.cancelCommand}
      aria-labelledby="dialog-title"
    >
    <AppBar id={`appbarT`} theme="primary" key="primary">
      <AppBarNav onClick={handleReset} aria-label="Close">
        <ArrowBackFontIcon />
      </AppBarNav>
      <AppBarTitle>{props.create ? "Creating Var" : "Modifying " + modalState.name}</AppBarTitle>
    </AppBar>
      <DialogContent>
        <div className={formStyles.container}>
          <Grid>
            <GridCell colSpan={12} className={gridStyles.item}>
              <div className={formStyles.container}>
                <FormThemeProvider theme='outline'>
                  <Form className={formStyles.form} onSubmit={handleSubmit} onReset={handleReset}>
                    <Select
                      id='device'
                      key='device'
                      options={ctx.devices.map((item) => ({
                        label: item.name,
                        value: item.id
                      }))}
                      value={modalState.device.toString()}
                      placeholder="Choose..."
                      label="Device"
                      className={formStyles.item}
                      onChange={(value) => setModalState((prevState) => ({ ...prevState, device: Number(value)}))}
                    />
                    <TextField
                      id='name'
                      key='name'
                      type='string'
                      label="Var Name"
                      className={formStyles.item}
                      value={modalState.name}
                      onChange={(e) => InlineValidation(e.target.value)}
                      onBlur={(e) => {
                        if (prevName !== modalState.name && !modalState.varNameNotValid) {
                          setPrevName(modalState.name)
                        }
                      }}
                      error={modalState.varNameNotValid}
                    />
                    <Select
                      id='type'
                      key='type'
                      options={ctx.types.map((item) => ({
                        label: item.name,
                        value: item.id
                      }))}
                      value={modalState.type.toString()}
                      placeholder="Choose..."
                      label="Var Type"
                      className={formStyles.item}
                      onChange={(value) => setModalState((prevState) => ({ ...prevState, type: Number(value)}))}
                    />
                    <Select
                      id='um'
                      key='um'
                      options={ctx.ums.map((item) => ({
                        label: item.name,
                        value: item.id
                      }))}
                      value={modalState.um !== null ? modalState.um.toString() : 0}
                      placeholder="Choose..."
                      label="um"
                      className={formStyles.item}
                      onChange={(value) => setModalState((prevState) => ({ ...prevState, um: Number(value)}))}
                    />
                    <Select
                      id='logic_state'
                      key='logic_state'
                      options={ctx.logicStates.map((item) => ({
                        label: item.name,
                        value: item.id
                      }))}
                      value={modalState.logic_state !== null ? modalState.logic_state.toString() : 0}
                      placeholder="Choose..."
                      label="Logic state"
                      className={formStyles.item}
                      onChange={(value) => setModalState((prevState) => ({ ...prevState, logic_state: Number(value)}))}
                    />
                    <TextField
                      id='comment'
                      key='comment'
                      type='string'
                      label="Var Comment"
                      className={formStyles.item}
                      value={modalState.comment}
                      onChange={(e) => setModalState((prevState) => ({ ...prevState, comment: e.target.value}))}
                    />
                    <div className={formStyles.btn_container}>
                      <Button
                        type="submit"
                        theme="primary"
                        themeType="outline"
                        className={formStyles.btn}
                        disabled={modalState.varNameNotValid || modalState.name.length === 0}
                      >
                        {props.create ? "Create" : "Save"}
                      </Button>
                      <Button
                        type="reset"
                        themeType="outline"
                        className={formStyles.btn}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Form>
                </FormThemeProvider>
              </div>
            </GridCell>
          </Grid>
        </div>
      </DialogContent>      
    </Dialog>
  )
}
export default UpsertVarPopup