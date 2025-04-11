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
import gridStyles from '../../styles/Grid.module.scss'
import formStyles from '../../styles/Form.module.scss'
import {ctxData} from "../../Helpers/CtxProvider"

function UpsertDevicePopup (props) {
  const ctx = useContext(ctxData);
  const [modalState, setModalState] = useState({
    visible: false,
    name: '',
    modalType: props.modalType,
    template: 0
  })
  
  //Form Events
  const handleSubmit = (event) => {
    event.preventDefault()
    props.upsertDevice({
      name: modalState.name,
      template: modalState.template
    })
    setModalState((prevState) => ({ ...prevState, name: "", template: 0}))
  }
  const handleReset = () => {
    setModalState((prevState) => ({ ...prevState, name: ""}))
    props.cancelCommand()
  }

  useEffect(() => {
    setModalState((prevState) => ({ ...prevState, name: props.name, visible: props.visible}))
  },[props.name, props.visible])
  
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
      <AppBarTitle>{props.create ? "Creating Device" : "Modifying " + modalState.name}</AppBarTitle>
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
                      label="Device Name"
                      className={formStyles.item}
                      value={modalState.name}
                      onChange={(e) => setModalState((prevState) => ({ ...prevState, name: e.target.value}))}
                    />
                    <Select
                      id="template"
                      key="template"
                      options={ctx.templates.map((item) => ({
                        label: item.name,
                        value: item.id,
                      }))}
                      value={modalState.template.toString()}
                      label="Template"
                      className={formStyles.item}
                      onChange={(value) =>
                        setModalState((prevState) => ({
                          ...prevState,
                          template: Number(value),
                        }))
                      }
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
          </Grid>
        </div>
      </DialogContent>      
    </Dialog>
  )
}
export default UpsertDevicePopup