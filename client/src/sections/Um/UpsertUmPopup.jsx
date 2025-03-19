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

function UpsertUmPopup (props) {

  const [modalState, setModalState] = useState({ visible: false, name: '', metric: '', imperial: '', gain: 1.0, offset: 0.0, modalType: props.modalType})
  
  //Form Events
  const handleSubmit = (event) => {
    event.preventDefault()
    props.upsertUm({
      name: modalState.name,
      metric: modalState.metric,
      imperial: modalState.imperial,
      gain: modalState.gain,
      offset: modalState.offset
    })
    setModalState((prevState) => ({ ...prevState, name: ""}))
  }
  const handleReset = () => {
    setModalState((prevState) => ({ ...prevState, name: ""}))
    props.cancelCommand()
  }

  useEffect(() => {
    setModalState((prevState) => ({ ...prevState, name: props.name, metric: props.metric, imperial: props.imperial, gain: props.gain, offset: props.offset, visible: props.visible}))
  },[props.name, props.metric, props.imperial, props.gain, props.offset, props.visible])
  
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
      <AppBarTitle>{props.create ? "Creating Um" : "Modifying " + modalState.name}</AppBarTitle>
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
                      label="Um Name"
                      className={formStyles.item}
                      value={modalState.name}
                      onChange={(e) => setModalState((prevState) => ({ ...prevState, name: e.target.value}))}
                    />
                    <TextField
                      id='metric'
                      key='metric'
                      type='string'
                      label='Metric'
                      className={formStyles.item}
                      value={modalState.metric}
                      onChange={(e) => setModalState((prevState) => ({ ...prevState, metric: e.target.value}))}
                    />
                    <TextField
                      id='imperial'
                      key='imperial'
                      type='string'
                      label='Imperial'
                      className={formStyles.item}
                      value={modalState.imperial}
                      onChange={(e) => setModalState((prevState) => ({ ...prevState, imperial: e.target.value}))}
                    />
                    <TextField
                      id='gain'
                      key='gain'
                      type='number'
                      label='Gain'
                      className={formStyles.item}
                      value={Number(modalState.gain)}
                      onChange={(e) => setModalState((prevState) => ({ ...prevState, gain: e.target.value}))}
                    />
                    <TextField
                      id='offset'
                      key='offset'
                      type='number'
                      label='Offset'
                      className={formStyles.item}
                      value={Number(modalState.offset)}
                      onChange={(e) => setModalState((prevState) => ({ ...prevState, offset: e.target.value}))}
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
export default UpsertUmPopup