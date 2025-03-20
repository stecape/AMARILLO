import { useContext } from "react";
import { GridCell } from '@react-md/utils';
import { Button } from "@react-md/button";
import { Typography } from "@react-md/typography";
import styles from "./LogicSelection.module.scss";
import { ctxData } from "../../../Helpers/CtxProvider";
import axios from 'axios';

function LogicSelection(props) {
  const ctx = useContext(ctxData);
  let device = ctx.devices.filter(d => d.id === props.ctrl.device)[0].name;
  let commandId = props.ctrl.fields.Command;
  let status = ctx.tags.filter(t => t.id === props.ctrl.fields.Status)[0].value;
  if (status === null) status = 0
  let logic_state = ctx.logicStates.filter(l => l.id === props.ctrl.logic_state)[0].value;

  return (
    <GridCell colSpan={12} className={styles.logicSelection}>
      <Typography
        id="dialog-title"
        type="headline-6"
        margin="none"
        color="secondary"
        className={styles.title}
      >
        {device} - {props.ctrl.name}
      </Typography>
      <div className={styles.buttons}>
        {logic_state.map((state, i) => (
          state !== "" && (
            <Button
              key={i}
              themeType="outline"
              theme={status.value === Math.pow(2, i) ? "primary" : "clear"}
              onClick={() => axios.post('http://localhost:3001/api/mqtt/write', { device: device, id: commandId, value: Math.pow(2, i) })}
              className={styles.button}
            >
              {state}
            </Button>
          )
        ))}
      </div>
    </GridCell>
  );
}

export default LogicSelection;