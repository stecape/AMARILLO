import { useContext, useState } from "react";
import { ctxData } from "../../../Helpers/CtxProvider";
import Connector from "./Connector";
import TestPoint from "./Blocks/TestPoint";
import Saturation from "./Blocks/Saturation";
import axios from 'axios'
import SetPopup from "../SetPopup/SetPopup";
import styles from "./Pid.module.scss";

function Pid({ ctrl }) {
  // Usa la variabile d'ambiente per configurare l'URL del server
  const serverIp = process.env.REACT_APP_SERVER_IP || "http://localhost:3001"
  
  // Stato per gestire la visibilità del popup
  const [isDialogVisible, setDialogVisible] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [setPopup, setSetPopup] = useState(null);

  const ctx = useContext(ctxData);

  // Recupera valore da tag
  const getValue = (key) => {
    const id = ctrl.fields[key];
    const tag = ctx.tags.find(t => t.id === id);
    return tag?.value?.value ?? '-';
  };

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

  // Funzione per aprire il popup
  const handleSetClick = (setProps, label, value) => {
    if (!setProps) return;
    // Estrai parametri per SetPopup
    const min = setProps.min ?? null;
    const max = setProps.max ?? null;
    const device = ctx.devices.find(d => d.id === setProps.device)?.name || "Unknown Device"
    const ctrlName = setProps.name ?? label;
    setSetPopup({ min, max, device, ctrl: setProps, ctrlName, value, label });
    setInputValue(value);
    setDialogVisible(true);
  };

  // Funzione per chiudere il popup
  const closeDialog = () => {
    setDialogVisible(false)
  }

  // Funzione per confermare il nuovo valore
  const confirmValue = () => {
    axios.post(`${serverIp}/api/mqtt/write`, { device: setPopup.device, id: setPopup.ctrl.fields.InputValue, value: inputValue })
    closeDialog()
  }

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
            <TestPoint label="E" value={getValue("E")} {...E}/>
            <TestPoint label="kP" value={getValue("PID.kP.Set.Value")} {...kP} Set={ctx.controls.Forno["PID.kP"]} onSetClick={() => handleSetClick(ctx.controls.Forno["PID.kP"], "kP", getValue("kP"))}/>
            <TestPoint label="kPE" value={getValue("kpError")} {...kPE}/>
            <TestPoint label="Td" value={getValue("PID.Td.Set.Value")} {...Td} Set={ctx.controls.Forno["PID.Td"]} onSetClick={() => handleSetClick(ctx.controls.Forno["PID.Td"], "Td", getValue("Td"))}/>
            <TestPoint label="dC" value={getValue("DerivativeCorrection")} {...dC}/>
            <TestPoint label="Gp" value={getValue("PID.Gp.Set.Value")} {...Gp} Set={ctx.controls.Forno["PID.Gp"]} onSetClick={() => handleSetClick(ctx.controls.Forno["PID.Gp"], "Gp", getValue("Gp"))}/>
            <TestPoint label="pC" value={getValue("ProportionalCorrection")} {...pC}/>
            <TestPoint label="Ti" value={getValue("PID.Ti.Set.Value")} {...Ti} Set={ctx.controls.Forno["PID.Ti"]} onSetClick={() => handleSetClick(ctx.controls.Forno["PID.Ti"], "Ti", getValue("Ti"))}/>
            <TestPoint label="iC" value={getValue("IntegralCorrection")} {...iC}/>
            <TestPoint label="C" value={getValue("PID.Correction")} {...C}/>
            <Saturation {...PidSat} />
            <TestPoint label="PidMax" value={getValue("PidMax")} {...PidMax} Set={ctx.controls.Forno["PID.PidMax"]} onSetClick={() => handleSetClick(ctx.controls.Forno["PID.PidMax"], "PidMax", getValue("PidMax"))}/>
            <TestPoint label="PidMin" value={getValue("PidMin")} {...PidMin} Set={ctx.controls.Forno["PID.PidMin"]} onSetClick={() => handleSetClick(ctx.controls.Forno["PID.PidMin"], "PidMin", getValue("PidMin"))}/>
            <TestPoint label="Reference" value={getValue("Reference")} {...Reference} />
            <TestPoint label="RawOut" value={getValue("RawOut")} {...RawOut} />
            <Saturation {...OutSat} />
            <TestPoint label="OutMax" value={getValue("OutMax")} {...OutMax} Set={ctx.controls.Forno["PID.OutMax"]} onSetClick={() => handleSetClick(ctx.controls.Forno["PID.OutMax"], "OutMax", getValue("OutMax"))}/>
            <TestPoint label="OutMin" value={getValue("OutMin")} {...OutMin} Set={ctx.controls.Forno["PID.OutMin"]} onSetClick={() => handleSetClick(ctx.controls.Forno["PID.OutMin"], "OutMin", getValue("OutMin"))}/>
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
      {setPopup && (
        <SetPopup
          isDialogVisible={isDialogVisible}
          confirmValue={confirmValue}
          closeDialog={closeDialog}
          inputValue={inputValue}
          setInputValue={setInputValue}
          min={setPopup.min}
          max={setPopup.max}
          device={setPopup.device}
          ctrlName={setPopup.ctrlName}
          value={setPopup.value}
          label={setPopup.label}
        />
      )}
    </div>
  );
}

export default Pid;
