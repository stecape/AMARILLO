import React, { useContext, useState } from "react";
import { ctxData } from "../../../Helpers/CtxProvider";
import Set from "../Set/Set";
import Connector from "./Connector";
import TestPoint from "./Blocks/TestPoint";
import Saturation from "./Blocks/Saturation";
import styles from "./Pid.module.scss";

function Pid({ ctrl, label }) {
  const ctx = useContext(ctxData);
  const [setPopup, setSetPopup] = useState(null); // quale campo mostrare come popup
  if (!ctrl || !ctrl.fields) return null;

  // Trova il prefisso dinamico (es: "PID.", "LOOP.", ecc.)
  const prefix = ctrl.name+".";

  // Funzione per aprire il popup Set
  const handleSetClick = (key) => setSetPopup(key);
  const handleClose = () => setSetPopup(null);

  // Mappa dei campi impostabili (Set)
  const settable = ["kP", "Ti", "Td", "Gp", "PidMin", "PidMax", "OutMin", "OutMax"];

  // Recupera valore da tag
  const getValue = (key) => {
    const id = ctrl.fields[key];
    const tag = ctx.tags.find(t => t.id === id);
    return tag?.value?.value ?? '-';
  };

  // Recupera oggetto controllo per Set
  const getSetCtrl = (key) => ctx.controls[`${prefix}.${key}`];

  // Configurazione PID diagram (esempio base)
  const config = {
    blockDistanceX: 100,
    blockDistanceY: 120,
    blockWidth: 48,
    blockHeight: 48,
    start: { x: 20, y: 0 }
  };

  // Definizione anchor point per ogni blocco (relative rispetto a config.start)
  const E = { x: config.start.x,  y: config.start.y, anchor: "left", label: "Error", content: "ε" };
  const kP = { x: E.x + config.blockWidth + config.blockDistanceX, y: E.y - config.blockDistanceY, anchor: "left", label: "kP" };
  const kPE = { x: E.x + config.blockWidth + config.blockDistanceX, y: E.y, anchor: "left", label: "kP*ε", content : "x" };
  const Td = { x: kPE.x + config.blockWidth + 2*config.blockDistanceX, y: kPE.y - 3*config.blockDistanceY, anchor: "left", label: "Td" };
  const dC = { x: kPE.x + config.blockWidth + 2*config.blockDistanceX, y: kPE.y - 2*config.blockDistanceY, anchor: "left", label: "Deriv. Corr.", content: "δ"};
  const Gp = { x: kPE.x + config.blockWidth + 2*config.blockDistanceX, y: kPE.y - config.blockDistanceY, label: "Gp"};
  const pC = { x: kPE.x + config.blockWidth + 2*config.blockDistanceX, y: kPE.y, label: "Prop. Corr.", content: "x", anchor: "left" };
  const Ti = { x:  kPE.x + config.blockWidth + 2*config.blockDistanceX, y: kPE.y + config.blockDistanceY, anchor: "left", label: "Ti"};
  const iC = { x:  kPE.x + config.blockWidth + 2*config.blockDistanceX, y: kPE.y + 2*config.blockDistanceY, anchor: "left", label: "Int. Corr.", content: "∫" };
  const C = { x: pC.x + config.blockWidth + 2*config.blockDistanceX, y: pC.y, anchor: "left", label: "Correction", content: "C" };
  const PidSat = { x: C.x + config.blockWidth + config.blockDistanceX, y: C.y, anchor: "left"};
  const PidMax = { x: PidSat.x + 0.5*config.blockWidth, y: C.y - config.blockDistanceY, anchor: "left", label: "PidMax"};
  const PidMin = { x: PidSat.x + 0.5*config.blockWidth, y: C.y + config.blockDistanceY, anchor: "left", label: "PidMin"};
  const Reference = { x: PidSat.x + 2*config.blockWidth + config.blockDistanceX, y: C.y + config.blockDistanceY, anchor: "left", label: "Reference"};
  const RawOut = { x: PidSat.x + 2*config.blockWidth + config.blockDistanceX, y: C.y, anchor: "left", label: "RawOut", content: "+" };
  const OutSat = { x: RawOut.x + config.blockWidth + config.blockDistanceX, y: RawOut.y, anchor: "left"};
  const OutMax = { x: OutSat.x + 0.5*config.blockWidth, y: RawOut.y - config.blockDistanceY, anchor: "left", label: "OutMax"};
  const OutMin = { x: OutSat.x + 0.5*config.blockWidth, y: RawOut.y + config.blockDistanceY, anchor: "left", label: "OutMin"};
  const Out = { x: OutSat.x + 2*config.blockDistanceX, y: OutSat.y, anchor: "left", label: "Out"}

  return (
    <div className={styles.pidBlockWrapper} style={{ overflow: 'auto' }}>
      <svg
        viewBox="0 0 1100 100"
        className={styles.pidBlockSvg}
        width="1100"
        height="500"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', minWidth: 1100, minHeight: 500 }}
      >
        <g transform="scale(0.5) translate(0, 100)">
          <g transform="translate(50, 50)">
            {/* Blocchi PID */}
            <TestPoint label="E" value={getValue("E")} {...E} />
            <TestPoint label="kP" value={getValue("kP")} {...kP} onClick={() => handleSetClick("kP")} />
            <TestPoint label="kPE" value={getValue("kPE")} {...kPE} onClick={() => handleSetClick("kPE")} />
            <TestPoint label="dC" value={getValue("dC")} {...dC} />
            <TestPoint label="Td" value={getValue("Td")} {...Td} onClick={() => handleSetClick("Td")} />
            <TestPoint label="Gp" value={getValue("Gp")} {...Gp} onClick={() => handleSetClick("Gp")} />
            <TestPoint label="pC" value={getValue("pC")} {...pC} />
            <TestPoint label="Ti" value={getValue("Ti")} {...Ti} onClick={() => handleSetClick("Ti")} />
            <TestPoint label="iC" value={getValue("iC")} {...iC} onClick={() => handleSetClick("iC")} />
            <TestPoint label="C" value={getValue("C")} {...C} />
            <Saturation {...PidSat} />
            <TestPoint label="PidMax" value={getValue("PidMax")} {...PidMin} onClick={() => handleSetClick("PidMax")} />
            <TestPoint label="PidMin" value={getValue("PidMin")} {...PidMax} onClick={() => handleSetClick("PidMin")} />
            <TestPoint label="Reference" value={getValue("Reference")} {...Reference} />
            <TestPoint label="RawOut" value={getValue("RawOut")} {...RawOut} />
            <Saturation {...OutSat} />
            <TestPoint label="OutMax" value={getValue("OutMax")} {...OutMax} onClick={() => handleSetClick("OutMax")} />
            <TestPoint label="OutMin" value={getValue("OutMin")} {...OutMin} onClick={() => handleSetClick("OutMin")} />
            <TestPoint label="Out" value={getValue("Out")} {...Out} />

            {/* Connectors for PID logic (nuovo formato) */}
            {/* E → kPE */}
            <Connector start={{x: E.x + config.blockWidth, y: E.y}} offsets={[[config.blockDistanceX, 0]]} arrow />
            {/* kP → kPE */}
            <Connector start={{x: kP.x + config.blockWidth/2, y: kP.y + config.blockHeight/2}} offsets={[[0, config.blockDistanceY - config.blockHeight]]} arrow />
            {/* kPE → Node1 */}
            <Connector start={{x: kPE.x + config.blockWidth, y: kPE.y}} offsets={[[config.blockDistanceX, 0]]} dot />
            {/* Node1 → cD */}
            <Connector start={{x: kPE.x + config.blockWidth + config.blockDistanceX, y: kPE.y}} offsets={[[0, - 2*config.blockDistanceY], [config.blockDistanceX, 0]]} arrow />
            {/* Node1 → pC */}
            <Connector start={{x: kPE.x + config.blockWidth + config.blockDistanceX, y: kPE.y}} offsets={[[config.blockDistanceX, 0]]} arrow />
            {/* Node1 → iC */}
            <Connector start={{x: kPE.x + config.blockWidth + config.blockDistanceX, y: kPE.y}} offsets={[[0, + 2*config.blockDistanceY], [config.blockDistanceX, 0]]} arrow />
            {/* Td → dC */}
            <Connector start={{x: Td.x + config.blockWidth/2, y: Td.y + config.blockHeight/2}} offsets={[[0, config.blockDistanceY - config.blockHeight]]} arrow />
            {/* Gp → pC */}
            <Connector start={{x: Gp.x + config.blockWidth/2, y: Gp.y + config.blockHeight/2}} offsets={[[0, config.blockDistanceY - config.blockHeight]]} arrow />
            {/* Ti → iC */}
            <Connector start={{x: Ti.x + config.blockWidth/2, y: Ti.y + config.blockHeight/2}} offsets={[[0, config.blockDistanceY - config.blockHeight]]} arrow />
            {/* dC → Node2 */}
            <Connector start={{x: dC.x + config.blockWidth, y: dC.y}} offsets={[[config.blockDistanceX, 0], [0, 2*config.blockDistanceY]]} arrow />
            {/* pC → Node2 */}
            <Connector start={{x: pC.x + config.blockWidth, y: pC.y}} offsets={[[config.blockDistanceX, 0]]} dot />
            {/* iC → Node2 */}
            <Connector start={{x: iC.x + config.blockWidth, y: iC.y}} offsets={[[config.blockDistanceX, 0], [0, -2*config.blockDistanceY]]} arrow />
            {/* Node2 → C */}
            <Connector start={{x: pC.x + config.blockWidth + config.blockDistanceX, y: pC.y}} offsets={[[config.blockDistanceX, 0]]} arrow />
            {/* C → PidSat */}
            <Connector start={{x: C.x + config.blockWidth, y: C.y}} offsets={[[config.blockDistanceX, 0]]} arrow />
            {/* PidMax → PidSat */}
            <Connector start={{x: C.x + 2*config.blockWidth + config.blockDistanceX, y: PidMax.y + config.blockHeight/2}} offsets={[[0, config.blockHeight]]} arrow />
            {/* PidMin → PidSat */}
            <Connector start={{x: C.x + 2*config.blockWidth + config.blockDistanceX, y: PidMin.y - config.blockHeight/2}} offsets={[[0, -config.blockHeight]]} arrow />
            {/* PidSat → RawOut */}
            <Connector start={{x: PidSat.x + 2*config.blockWidth, y: PidSat.y}} offsets={[[config.blockDistanceX, 0]]} arrow />
            {/* Reference → RawOut */}
            <Connector start={{x: RawOut.x + 0.5*config.blockWidth, y: RawOut.y + config.blockDistanceY - config.blockHeight/2}} offsets={[[0, -config.blockDistanceY + config.blockHeight]]} arrow />
            {/* RawOut → OutSat */}
            <Connector start={{x: RawOut.x + config.blockWidth, y: RawOut.y}} offsets={[[config.blockDistanceX, 0]]} arrow />
            {/* PidMax → PidSat */}
            <Connector start={{x: RawOut.x + 2*config.blockWidth + config.blockDistanceX, y: OutMax.y + config.blockHeight/2}} offsets={[[0, config.blockHeight]]} arrow />
            {/* PidMin → PidSat */}
            <Connector start={{x: RawOut.x + 2*config.blockWidth + config.blockDistanceX, y: OutMin.y - config.blockHeight/2}} offsets={[[0, -config.blockHeight]]} arrow />
            {/* RawOut → OutSat */}
            <Connector start={{x: OutSat.x + 2*config.blockWidth, y: OutSat.y}} offsets={[[config.blockDistanceX, 0]]} arrow />
          </g>
        </g>
      </svg>
      {/* Popup Set dinamico */}
      {setPopup && getSetCtrl(setPopup) && (
        <Set ctrl={getSetCtrl(setPopup)} label={setPopup} onClose={handleClose} open />
      )}
    </div>
  );
}

export default Pid;
