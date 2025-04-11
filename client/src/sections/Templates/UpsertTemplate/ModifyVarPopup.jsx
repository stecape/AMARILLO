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

function ModifyVarPopup (props) {
  const ctx = useContext(ctxData);
  const [modalState, setModalState] = useState({
    visible: false,
    name: '',
    modalType: props.modalType,
    type: 0,
    um: 0,
    logic_state: 0,
    comment: '',
    varNameNotValid: false,
  });

  // Input Validation
  const InlineValidation = (value) => {
    let pattern = /[^A-Za-z0-9_]|^[^A-Za-z_]/
    console.log("props: ", props)
    console.log("value: ", value)
    setModalState((prevState) => ({ ...prevState, name: value, varNameNotValid: pattern.test(value) || props.vars.find(i => i.name === value && i.QRef !== props.QRef) || value === ""}))
  }
  
  //Form Events
  const handleSubmit = (event) => {
    event.preventDefault();
    props.updVar({
      name: modalState.name,
      type: modalState.type,
      um: modalState.um,
      logic_state: modalState.logic_state,
      comment: modalState.comment,
    });
  };

  const handleReset = (event) => {
    event.preventDefault();
    props.cancelCommand();
  };

  useEffect(() => {
    setModalState((prevState) => ({
      ...prevState,
      name: props.name,
      type: props.type,
      um: props.um,
      logic_state: props.logic_state,
      comment: props.comment,
      visible: props.visible,
    }));
  }, [props.name, props.visible, props.type, props.um, props.logic_state, props.comment]);

  return (
    <Dialog
      id="upsert-var-dialog"
      role="alertdialog"
      type={modalState.modalType}
      visible={modalState.visible}
      onRequestClose={props.cancelCommand}
      aria-labelledby="dialog-title"
    >
      <FormThemeProvider theme="outline">
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
              id="name"
              key="name"
              type="string"
              label="Var Name"
              value={modalState.name}
              onChange={(e) => InlineValidation(e.target.value)}
              error={modalState.varNameNotValid}
            />
            <Select
              id="type"
              key="type"
              options={ctx.types.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
              value={modalState.type.toString()}
              label="Type"
              onChange={(value) =>
                setModalState((prevState) => ({
                  ...prevState,
                  type: Number(value),
                }))
              }
            />
            <Select
              id="um"
              key="um"
              options={ctx.ums.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
              value={modalState.um !== null ? modalState.um.toString() : 0}
              placeholder="Choose..."
              label="um"
              onChange={(value) =>
                setModalState((prevState) => ({
                  ...prevState,
                  um: Number(value),
                }))
              }
            />
            <Select
              id="logic_state"
              key="logic_state"
              options={ctx.logicStates.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
              value={modalState.logic_state !== null ? modalState.logic_state.toString() : 0}
              placeholder="Choose..."
              label="Logic state"
              onChange={(value) =>
                setModalState((prevState) => ({
                  ...prevState,
                  logic_state: Number(value),
                }))
              }
            />
            <TextField
              id="comment"
              key="comment"
              type="string"
              label="Var Comment"
              value={modalState.comment}
              onChange={(e) =>
                setModalState((prevState) => ({
                  ...prevState,
                  comment: e.target.value,
                }))
              }
            />
          </DialogContent>
          <DialogFooter>
            <Button type="reset" id="dialog-cancel">
              Cancel
            </Button>
            <Button
              type="submit"
              id="dialog-modify"
              theme="primary"
              disabled={modalState.varNameNotValid || modalState.name.length === 0}
            >
              Save
            </Button>
          </DialogFooter>
        </Form>
      </FormThemeProvider>
    </Dialog>
  );
}
export default ModifyVarPopup;