import React, { useContext, useState } from "react";
import { ctxData } from "../../../Helpers/CtxProvider";
import Set from "../Set/Set";
import Block from "./Blocks/Block";
import Connector from "./Connector";
import TestPoint from "./Blocks/TestPoint";
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
    blockDistanceY: 100,
    blockWidth: 60,
    blockHeight: 60,
    start: { x: 50, y: 220 }
  };

  // Definizione anchor point per ogni blocco (relative rispetto a config.start)
  const E = { x: config.start.x,  y: config.start.y, anchor: 'left' };
  const kP = { x: E.x + config.blockWidth + config.blockDistanceX, y: E.y, anchor: 'left' };
  const Td = { x: kP.x + 1.5*config.blockWidth + 2*config.blockDistanceX, y: kP.y - config.blockHeight - config.blockDistanceY, anchor: 'top' };
  const Gp = { x: kP.x + config.blockWidth + 2*config.blockDistanceX, y: kP.y, anchor: 'left' };
  const Ti = { x:  kP.x + 1.5*config.blockWidth + 2*config.blockDistanceX, y: kP.y + config.blockHeight + config.blockDistanceY, anchor: 'bottom' };
  const C = { x: Gp.x + config.blockWidth + 2*config.blockDistanceX, y: Gp.y - 0.5*config.blockHeight, label: "C"};
  const PidMin = { x: C.x + config.blockDistanceX, y: C.y - config.blockDistanceY, anchor: 'top' };
  const PidMax = { x: C.x + config.blockDistanceX, y: C.y + config.blockDistanceY, anchor: 'bottom' };
  const Reference = { x: PidMin.x + config.blockDistanceX, y: C.y, anchor: 'left' };
  const OutMin = { x: Reference.x + config.blockDistanceX, y: Reference.y - config.blockDistanceY, anchor: 'top' };
  const OutMax = { x: Reference.x + config.blockDistanceX, y: Reference.y + config.blockDistanceY, anchor: 'bottom' };
  const Out = { x: OutMin.x + config.blockDistanceX, y: C.y, anchor: 'right' }

  return (
    <div className={styles.pidBlockWrapper}>
      <svg viewBox="0 0 1100 500" className={styles.pidBlockSvg}>
        {/* Blocchi PID */}
        <Block label="E" value={getValue("E")} {...E} />
        <Block label="kP" value={getValue("kP")} {...kP} onClick={() => handleSetClick("kP")} />
        <Block label="Td" value={getValue("Td")} {...Td} onClick={() => handleSetClick("Td")} />
        <Block label="Gp" value={getValue("Gp")} {...Gp} onClick={() => handleSetClick("Gp")} />
        <Block label="Ti" value={getValue("Ti")} {...Ti} onClick={() => handleSetClick("Ti")} />
        <TestPoint label="C" value={getValue("C")} {...C} />
        <Block label="PidMin" value={getValue("PidMin")} {...PidMin} onClick={() => handleSetClick("PidMin")} />
        <Block label="PidMax" value={getValue("PidMax")} {...PidMax} onClick={() => handleSetClick("PidMax")} />
        <Block label="Reference" value={getValue("Reference")} {...Reference} onClick={() => handleSetClick("Reference")} />
        <Block label="OutMin" value={getValue("OutMin")} {...OutMin} onClick={() => handleSetClick("OutMin")} />
        <Block label="OutMax" value={getValue("OutMax")} {...OutMax} onClick={() => handleSetClick("OutMax")} />
        <Block label="Out" value={getValue("Out")} {...Out} />
        {/* Connectors for PID logic (nuovo formato) */}
        {/* E → kP */}
        <Connector start={{x: E.x + config.blockWidth, y: E.y}} offsets={[[config.blockDistanceX, 0]]} arrow />
        {/* kP → Node1 */}
        <Connector start={{x: kP.x + config.blockWidth, y: kP.y}} offsets={[[config.blockDistanceX, 0]]} dot />
        {/* Node1 → Gp */}
        <Connector start={{x: kP.x + config.blockWidth + config.blockDistanceX, y: kP.y}} offsets={[[config.blockDistanceX, 0]]} arrow />
        {/* Node1 → Td */}
        <Connector start={{x: kP.x + config.blockWidth + config.blockDistanceX, y: kP.y}} offsets={[[0, - 0.5*config.blockHeight - config.blockDistanceY], [config.blockDistanceY, 0]]} arrow />
        {/* Node1 → Ti */}
        <Connector start={{x: kP.x + config.blockWidth + config.blockDistanceX, y: kP.y}} offsets={[[0, + 0.5*config.blockHeight + config.blockDistanceY], [config.blockDistanceY, 0]]} arrow />
        {/* kP → Node1 */}
        <Connector start={{x: Gp.x + config.blockWidth, y: Gp.y}} offsets={[[config.blockDistanceX, 0]]} dot />
        {/* Node1 → Gp */}
        <Connector start={{x: Gp.x + config.blockWidth + config.blockDistanceX, y: Gp.y}} offsets={[[config.blockDistanceX, 0]]} arrow />
        {/* Node1 → Td */}
        <Connector start={{x: Td.x + 0.5*config.blockWidth, y: Td.y + 0.5*config.blockHeight}} offsets={[[config.blockDistanceX, 0], [0, + 0.5*config.blockHeight + config.blockDistanceY]]} arrow />
        {/* Node1 → Ti */}
        <Connector start={{x: Ti.x + 0.5*config.blockWidth, y: Ti.y - 0.5*config.blockHeight}} offsets={[[config.blockDistanceX, 0], [0, - 0.5*config.blockHeight - config.blockDistanceY]]} arrow />
      </svg>
      {/* Popup Set dinamico */}
      {setPopup && getSetCtrl(setPopup) && (
        <Set ctrl={getSetCtrl(setPopup)} label={setPopup} onClose={handleClose} open />
      )}
    </div>
  );
}

export default Pid;
