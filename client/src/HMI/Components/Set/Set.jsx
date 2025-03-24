import { useContext } from "react";
import { GridCell } from '@react-md/utils';
import { Typography } from "@react-md/typography";
import styles from "./Set.module.scss";
import { ctxData } from "../../../Helpers/CtxProvider";


function Set(props) {
  const ctx = useContext(ctxData);

  // Controlla se ctx.controls esiste
  if (ctx.controls === undefined || Object.keys(ctx.controls).length === 0) {
    return null; // Non renderizzare nulla se ctx.controls non esiste
  }

  // Recupera il nome del dispositivo
  const device = ctx.devices.find(d => d.id === props.ctrl.device)?.name || "Unknown Device"

  //this controls has 2 subcontrols: set and limit.
  //We need to retrieve the subcontrols to fully describe the component
  const setCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.Set)
  const limitCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.Limit)
  //Retrieving all the divice information from the control and the subcontrols
  const um = ctx.ums.find(um => um.id === props.ctrl.um).metric
  const set = ctx.tags.find(t => t.id === setCtrl.fields.Value).value.value
  const max = ctx.tags.find(t => t.id === limitCtrl.fields.Max).value.value
  const min = ctx.tags.find(t => t.id === limitCtrl.fields.Min).value.value
  
  // Calcola la posizione della tacca del setpoint
  const setPointPosition = ((set - min) / (max - min)) * 100

    return (
    <GridCell colSpan={12} className={styles.set}>
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
      <div className={styles.bargraph}>
        <div className={styles.bar}>
          <div
            className={styles.setpoint}
            style={{ left: `${setPointPosition}%` }}
          />
        </div>
        <div className={styles.labels}>
          <span className={styles.min}>{min}</span>
          {min < 0 && max > 0 && <span className={styles.zero}>0</span>}
          <span className={styles.max}>{max}</span>
        </div>
      </div>
    </GridCell>
  );
}

export default Set;