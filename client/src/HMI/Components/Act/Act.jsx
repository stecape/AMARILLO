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
  const decimalsTag = ctx.tags.find(t => t.id === props.ctrl.fields.Decimals);
  const decimals = decimalsTag?.value?.value ?? 0; // Usa 0 come valore predefinito se Decimals è null
  const umTag = ctx.ums.find(um => um.id === props.ctrl.um)
  const um = umTag?.metric ?? "Unknown Unit" // Usa "Unknown Unit" come valore predefinito se non trovato
  const actTag = ctx.tags.find(t => t.id === actCtrl.fields.HMIValue)
  const act = parseFloat(actTag?.value?.value?.toFixed(decimals) ?? 0)
  const maxTag = ctx.tags.find(t => t.id === limitCtrl.fields.Max)
  const max = maxTag?.value?.value ?? 0 // Usa 0 come valore predefinito se Max è null
  const minTag = ctx.tags.find(t => t.id === limitCtrl.fields.Min)
  const min = minTag?.value?.value ?? 0 // Usa 0 come valore predefinito se Min è null

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