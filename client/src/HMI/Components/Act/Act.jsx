import { useContext } from "react";
import { GridCell } from '@react-md/utils';
import { Typography } from "@react-md/typography";
import styles from "./Act.module.scss";
import { ctxData } from "../../../Helpers/CtxProvider";
import Bar from "../Bar/Bar";


function Act(props) {
  const ctx = useContext(ctxData);

  // Controlla se ctx.controls esiste
  if (ctx.controls === undefined || Object.keys(ctx.controls).length === 0) {
    return null; // Non renderizzare nulla se ctx.controls non esiste
  }

  // Recupera il nome del dispositivo
  const device = ctx.devices.find(d => d.id === props.ctrl.device)?.name || "Unknown Device"

  //this controls has 2 subcontrols: act and limit.
  //We need to retrieve the subcontrols to fully describe the component
  const actCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.Act)
  const limitCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.Limit)

  //Retrieving all the divice information from the control and the subcontrols
  const decimals = ctx.tags.find(t => t.id === props.ctrl.fields.Decimals).value.value
  const um = ctx.ums.find(um => um.id === props.ctrl.um).metric
  const act = parseFloat(ctx.tags.find(t => t.id === actCtrl.fields.HMIValue).value.value.toFixed(decimals))
  const max = ctx.tags.find(t => t.id === limitCtrl.fields.Max).value.value
  const min = ctx.tags.find(t => t.id === limitCtrl.fields.Min).value.value

  return (
    <GridCell colSpan={12} className={styles.act}>
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
        <Typography
          id="act-value"
          type="headline-5"
          margin="none"
          color="primary"
          className={styles.value}
        >
          {act}
        </Typography>
        <Typography
          id="act-unit"
          type="subtitle-2"
          margin="none"
          color="secondary"
          className={styles.unit}
        >
          {um}
        </Typography>
      </div>
      <Bar act={act} max={max} min={min} />
    </GridCell>
  );
}

export default Act;