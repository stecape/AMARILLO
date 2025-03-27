import { useState, useEffect } from "react";
import styles from "./Bar.module.scss";

function Bar(props) {
  // Stati per i valori calcolati
  const [setPointPosition, setSetPointPosition] = useState(null);
  const [actWidth, setActWidth] = useState(0);
  const [startPoint, setStartPoint] = useState(0);
  const [zeroPosition, setZeroPosition] = useState(null);

  // Stati per le props
  const [max, setMax] = useState(props.max);
  const [min, setMin] = useState(props.min);

  useEffect(() => {
    // Aggiorna gli stati delle props
    setMax(props.max);
    setMin(props.min);

    // Calcola la posizione della tacca del setpoint
    const calculatedSetPointPosition = props.set !== undefined ? ((props.set - props.min) / (props.max - props.min)) * 100 : null;

    // Calcola la larghezza della barra (actWidth) e la posizione iniziale della barra (startPoint)
    let calculatedActWidth = 0;
    let calculatedStartPoint = 0;

    if (props.act !== undefined) {
      if (props.min < 0 && props.max > 0) {
        if (props.act < props.min) {
          calculatedActWidth = 1; // fuori scala
          calculatedStartPoint = 0; // fuori scala
        } else if (props.act > props.max) {
          calculatedActWidth = 1; // fuori scala
          calculatedStartPoint = 99; // fuori scala
        } else {
          if (props.act < 0) {
            calculatedActWidth = ((0 - props.act) / (props.max - props.min)) * 100;
            calculatedStartPoint = (props.act - props.min) / (props.max - props.min) * 100;
          } else {
            calculatedActWidth = ((props.act - 0) / (props.max - props.min)) * 100;
            calculatedStartPoint = (0 - props.min) / (props.max - props.min) * 100;
          }
        }
      } else if (props.min >= 0 && props.max > 0) {
        if (props.act < props.min) {
          calculatedActWidth = 1; // fuori scala
          calculatedStartPoint = 0; // fuori scala
        } else {
          calculatedActWidth = ((props.act - props.min) / (props.max - props.min)) * 100;
          calculatedStartPoint = 0;
        }
      } else if (props.min < 0 && props.max <= 0) {
        if (props.act > props.max) {
          calculatedActWidth = 1; // fuori scala
          calculatedStartPoint = 99; // fuori scala
        } else {
          calculatedActWidth = ((props.max - props.act) / (props.max - props.min)) * 100;
          calculatedStartPoint = 100 - calculatedActWidth;
        }
      }
    }

    // Calcola la posizione dello zero
    const calculatedZeroPosition = props.min < 0 && props.max > 0 ? `${(0 - props.min) / (props.max - props.min) * 100}%` : null;

    // Aggiorna gli stati calcolati
    setSetPointPosition(calculatedSetPointPosition);
    setActWidth(calculatedActWidth);
    setStartPoint(calculatedStartPoint);
    setZeroPosition(calculatedZeroPosition);
  }, [props.set, props.act, props.max, props.min]);

  return (
    <div className={styles.bargraph}>
      <div className={styles.bar}>
        {/* Barra dell'Act */}
        {props.act !== undefined && (
          <div
            className={styles.actBar}
            style={{
              width: `${Math.abs(actWidth) < 0.1 ? 1 : actWidth}%`,
              left: `${startPoint}%`,
            }}
          />
        )}
        {/* Setpoint sovrapposto */}
        {props.set !== undefined && (
          <div
            className={styles.setpoint}
            style={{
              left: `${setPointPosition}%`,
            }}
          />
        )}
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
  );
}

export default Bar;