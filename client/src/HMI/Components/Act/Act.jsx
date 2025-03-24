import { useContext } from "react";
import { GridCell } from '@react-md/utils';
import { Typography } from "@react-md/typography";
import styles from "./Act.module.scss";
import { ctxData } from "../../../Helpers/CtxProvider";


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
  const um = ctx.ums.find(um => um.id === props.ctrl.um).metric
  const act = ctx.tags.find(t => t.id === actCtrl.fields.Value).value.value
  const max = ctx.tags.find(t => t.id === limitCtrl.fields.Max).value.value
  const min = ctx.tags.find(t => t.id === limitCtrl.fields.Min).value.value
  
  // Calcola la larghezza della barra (actWidth) e la posizione iniziale della barra (startPoint)
  let actWidth
  let startPoint
  if (min < 0 && max > 0) {
    if(act < min) {
      actWidth = 1 //per capire che è fuori scala
      startPoint = 0 //per capire che è fuori scala
    } else if(act > max) {
      actWidth = 1 //per capire che è fuori scala
      startPoint = 99 //per capire che è fuori scala
    } else { 
      if(act < 0) {
        actWidth = ((0 - act) / (max - min)) * 100
        startPoint = (act - min)/(max-min)*100
      } else {
        actWidth = ((act - 0) / (max - min)) * 100
        startPoint = (0-min)/(max-min)*100
      }
    }
  } else if (min >= 0 && max > 0) {
    if(act < min) {
      actWidth = 1 //per capire che è fuori scala
      startPoint = 0 //per capire che è fuori scala
    } else {
      actWidth = ((act - min) / (max - min)) * 100
      startPoint = 0
    }
  } else if (min < 0 && max <= 0) {
    if(act > max) {
      actWidth = 1 //per capire che è fuori scala
      startPoint = 99 //per capire che è fuori scala
    } else {
      actWidth = ((max - act) / (max - min)) * 100
      startPoint = 100 - actWidth
    }
  }


  // Calcola la posizione dello zero
  const zeroPosition = min < 0 && max > 0 ? `${(0-min)/(max-min)*100}%` : null

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
      <div className={styles.bargraph}>
        <div className={styles.bar}>
          <div
            className={styles.actBar}
            style={{
              width: `${Math.abs(actWidth) < 0.1 ? 1 : actWidth}%`,
              left: `${startPoint}%`,
            }}
          />
        </div>
        <div className={styles.labels}>
          <span className={styles.min}>{min}</span>
            {min < 0 && max > 0 && (
              <span
                className={styles.zero}
                style={{ left: zeroPosition }}
              >
                0
              </span>
            )}
          <span className={styles.max}>{max}</span>
        </div>
      </div>
    </GridCell>
  );
}

export default Act;