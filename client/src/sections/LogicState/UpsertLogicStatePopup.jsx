import { useState, useEffect } from "react"
import { AppBar, AppBarTitle, AppBarNav } from '@react-md/app-bar';
import { Grid, GridCell } from '@react-md/utils'
import { Button } from "@react-md/button"
import { Dialog, DialogContent } from "@react-md/dialog"
import { ArrowBackFontIcon } from '@react-md/material-icons';
import {
  Form,
  TextField,
  FormThemeProvider
} from '@react-md/form'
import gridStyles from '../../styles/Grid.module.scss'
import formStyles from '../../styles/Form.module.scss'

function UpsertLogicStatePopup (props) {

  const [modalState, setModalState] = useState({ visible: false, name: '', value: Array(8).fill(""), modalType: props.modalType})
  
  //Form Events
  const handleSubmit = (event) => {
    event.preventDefault()
    props.upsertLogicState({
      name: modalState.name,
      value: modalState.value
    })
    setModalState((prevState) => ({ ...prevState, name: ""}))
  }

  const handleReset = () => {
    setModalState((prevState) => ({ ...prevState, name: ""}))
    props.cancelCommand()
  }

  const updateValue = (index, value) => {
    var valueArray = modalState.value
    console.log(index, value)
    valueArray[index] = value
    setModalState((prevState) => ({ ...prevState, value: valueArray}))
  }

  useEffect(() => {
    setModalState((prevState) => ({ ...prevState, name: props.name, value: props.value, visible: props.visible}))
  },[props.name, props.value, props.visible])
  
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
      <AppBarTitle>{props.create ? "Creating LogicState" : "Modifying " + modalState.name}</AppBarTitle>
    </AppBar>
      <DialogContent>
        <div className={formStyles.container}>
          <Grid>
            <GridCell colSpan={12} className={gridStyles.item}>
              <div className={formStyles.container}>
                <FormThemeProvider theme='outline'>
                  <Form className={formStyles.form} onSubmit={handleSubmit} onReset={handleReset}>
                    <TextField
                      id='name'
                      key='name'
                      type='string'
                      label="LogicState Name"
                      className={formStyles.item}
                      value={modalState.name}
                      onChange={(e) => setModalState((prevState) => ({ ...prevState, name: e.target.value}))}
                    />
                    <div className={formStyles.btn_container}>
                      <Button
                        type="submit"
                        theme="primary"
                        themeType="outline"
                        className={formStyles.btn}
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
            <GridCell colSpan={12} className={gridStyles.item}>
              <div className={formStyles.container}>
                {
                  Array.from({ length: 8 }, (_, i) => (
                  <TextField
                    id={i.toString()}
                    key={i.toString()}
                    type='string'
                    label={i.toString()}
                    className={formStyles.item}
                    value={modalState.value[i]}
                    onChange={(e) => updateValue(i, e.target.value)}
                  />
                  ))
                }
              </div>
            </GridCell>
          </Grid>
        </div>
      </DialogContent>      
    </Dialog>
  )
}
export default UpsertLogicStatePopup