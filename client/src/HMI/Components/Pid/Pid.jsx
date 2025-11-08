import { useContext, useState } from "react";
import { ctxData } from "../../../Helpers/CtxProvider";
import Connector from "./Connector";
import TestPoint from "./Blocks/TestPoint";
import Saturation from "./Blocks/Saturation";
import Switch2Way from "./Blocks/Switch2Way";
import Ramp from "./Blocks/Ramp";
import axios from 'axios'
import SetPopup from "../SetPopup/SetPopup";
import styles from "./Pid.module.scss";
import { getApiUrl } from "../../../Helpers/config";

function Pid(props) {
  // Usa la variabile d'ambiente per configurare l'URL del server
  const serverIp = getApiUrl()
  
  // Stato per gestire la visibilità del popup
  const [isDialogVisible, setDialogVisible] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [popupData, setPopupData] = useState({})

  const ctx = useContext(ctxData);

  
  // Recupera il nome del dispositivo
  const device = ctx.devices.find(d => d.id === props.ctrl.device)?.name || "Unknown Device"

  const getSetValue = (ctrl) => {
    const setCtrl = Object.values(ctx.controls[device]).find(control => control.id === ctrl.fields.Set);
    const tag = ctx.tags.find(t => t.id === setCtrl.fields.Value);
    return tag?.value?.value ?? '-';
  };

  const getRealValue = (ctrl) => {
    const tag = ctx.tags.find(t => t.id === ctrl.id);
    return tag?.value?.value ?? '-';
  };

  const getBoolValue = (ctrl) => {
    const tag = ctx.tags.find(t => t.id === ctrl.id);
    return tag?.value?.value ?? false;
  };

  //this controls has several subcontrols:
  //We need to retrieve the subcontrols to fully describe the component
  const SetCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.Set)
  const ActCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.Act)
  const ErrorCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.Error)
  const kpErrorCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.kpError)
  const AntiWindupContributeCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.AntiWindupContribute)
  const CorrectionCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.Correction)
  const DerivativeCorrectionCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.DerivativeCorrection)
  const ProportionalCorrectionCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.ProportionalCorrection)
  const IntegralCorrectionCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.IntegralCorrection)
  const PidMaxCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.PidMax)
  const PidMinCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.PidMin)
  const PidOutCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.PidOut)
  const ReferenceCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.Reference)
  const RawOutCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.RawOut)
  const OutMaxCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.OutMax)
  const OutMinCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.OutMin)
  const OutCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.Out)
  const ManualRefCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.ManualRef)
  const ManualModeCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.ManualMode)
  const StopCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.Stop)
  const OutSatCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.OutSat)
  const kPCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.kP)
  const TdCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.Td)
  const GpCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.Gp)
  const TiCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.Ti)
  const OutGradientCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.OutGradient)
  const TawCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.Taw)
  const SetpointGradientCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.SetpointGradient)

  // Configurazione PID diagram (esempio base)
  const config = {
    blockDistanceX: 100,
    blockDistanceY: 120,
    blockWidth: 48,
    blockHeight: 48,
    start: { x: -40, y: -150 }
  };

  // Definizione anchor point per ogni blocco (relative rispetto a config.start)
  const Setpoint = { x: config.start.x,  y: config.start.y, anchor: "left", label: "Setpoint"};
  const SetpointRamp = { x: Setpoint.x + config.blockWidth + config.blockDistanceX,  y: Setpoint.y, anchor: "left", label: "SetpointRamp"};
  const SetpointGradient = { x: SetpointRamp.x + 0.5*config.blockWidth, y: Setpoint.y - config.blockDistanceY, anchor: "left", label: "SetpointGradient"};
  const Actual = { x: SetpointRamp.x + 2*config.blockDistanceX,  y: Setpoint.y + config.blockDistanceY, anchor: "left", label: "Actual"};
  const E = { x: SetpointRamp.x + 2*config.blockDistanceX,  y: SetpointRamp.y, anchor: "left", label: "Error", content: "ε" };
  const kP = { x: E.x + config.blockWidth + config.blockDistanceX, y: E.y - config.blockDistanceY, anchor: "left", label: "kP" };
  const kPE = { x: E.x + config.blockWidth + config.blockDistanceX, y: E.y, anchor: "left", label: "kP*ε", content : "x" };
  const Td = { x: kPE.x + config.blockWidth + 2*config.blockDistanceX, y: kPE.y - 3*config.blockDistanceY, anchor: "left", label: "Td" };
  const dC = { x: kPE.x + config.blockWidth + 2*config.blockDistanceX, y: kPE.y - 2*config.blockDistanceY, anchor: "left", label: "Deriv. Corr.", content: "δ"};
  const Gp = { x: kPE.x + config.blockWidth + 2*config.blockDistanceX, y: kPE.y - config.blockDistanceY, label: "Gp"};
  const pC = { x: kPE.x + config.blockWidth + 2*config.blockDistanceX, y: kPE.y, label: "Prop. Corr.", content: "x", anchor: "left" };
  const Ti = { x:  kPE.x + config.blockWidth + 2*config.blockDistanceX, y: kPE.y + config.blockDistanceY, anchor: "left", label: "Ti"};
  const iC = { x:  kPE.x + config.blockWidth + 2*config.blockDistanceX, y: kPE.y + 2*config.blockDistanceY, anchor: "left", label: "Int. Corr.", content: "∫" };
  const awC = { x:  kPE.x + config.blockWidth + 2*config.blockDistanceX, y: kPE.y + 3*config.blockDistanceY, anchor: "left", label: "Aw Corr.", content: "∫" };
  const Taw = { x:  awC.x - config.blockWidth/2 - config.blockDistanceX, y: kPE.y + 3*config.blockDistanceY, anchor: "left", label: "Taw"};
  const C = { x: pC.x + config.blockWidth + 2*config.blockDistanceX, y: pC.y, anchor: "left", label: "Correction", content: "C" };
  const PidSat = { x: C.x + config.blockWidth + config.blockDistanceX, y: C.y, anchor: "left"};
  const PidMax = { x: PidSat.x + 0.5*config.blockWidth, y: C.y - config.blockDistanceY, anchor: "left", label: "PidMax"};
  const PidMin = { x: PidSat.x + 0.5*config.blockWidth, y: C.y + config.blockDistanceY, anchor: "left", label: "PidMin"};
  const Reference = { x: PidSat.x + 2*config.blockWidth + config.blockDistanceX, y: C.y + config.blockDistanceY, anchor: "left", label: "Reference"};
  const RawOut = { x: PidSat.x + 2*config.blockWidth + config.blockDistanceX, y: C.y, anchor: "left", label: "RawOut", content: "+" };
  const OutSat = { x: RawOut.x + config.blockWidth + config.blockDistanceX, y: RawOut.y, anchor: "left"};
  const OutMax = { x: OutSat.x + 0.5*config.blockWidth, y: RawOut.y - config.blockDistanceY, anchor: "left", label: "OutMax"};
  const OutMin = { x: OutSat.x + 0.5*config.blockWidth, y: RawOut.y + config.blockDistanceY, anchor: "left", label: "OutMin"};
  const ManualMode = { x: OutSat.x + 2*config.blockWidth + config.blockDistanceX, y: C.y, anchor: "left", label: "Mode"};
  const ManualRef = { x: ManualMode.x, y: ManualMode.y - config.blockDistanceY, anchor: "left", label: "ManualRef"};
  const Stop = { x: ManualMode.x + config.blockWidth + config.blockDistanceX, y: ManualMode.y, anchor: "left", label: "Stop"};
  const OutRamp = { x: Stop.x + config.blockWidth + config.blockDistanceX, y: Stop.y, anchor: "left", label: "OutRamp"};
  const OutGradient = { x: OutRamp.x + 0.5*config.blockWidth, y: OutRamp.y - config.blockDistanceY, anchor: "left", label: "OutGradient"};
  const Out = { x: OutRamp.x + 2*config.blockDistanceX, y: OutSat.y, anchor: "left", label: "Out"}

  // Gestione popup
  const openDialog = (ctrl) => {
    //this control has 2 subcontrols: set and limit.
    //We need to retrieve the subcontrols to fully describe the component
    const setCtrl = Object.values(ctx.controls[device]).find(control => control.id === ctrl.fields.Set)
    const limitCtrl = Object.values(ctx.controls[device]).find(control => control.id === ctrl.fields.Limit)

    //Retrieving all the divice information from the control and the subcontrols
    //const decimalsTag = ctx.tags.find(t => t.id === props.ctrl.fields.Decimals);
    //const decimals = decimalsTag?.value?.value ?? 0; // Usa 0 come valore predefinito se Decimals è null
    const umTag = ctx.ums.find(um => um.id === props.ctrl.um)
    const um = umTag?.metric ?? "Unknown Unit" // Usa "Unknown Unit" come valore predefinito se non trovato
    const setTag = ctx.tags.find(t => t.id === setCtrl.fields.Value)
    const set = setTag?.value?.value ?? 0 // Usa 0 come valore predefinito se Set è null
    const maxTag = ctx.tags.find(t => t.id === limitCtrl.fields.Max)
    const max = maxTag?.value?.value ?? 0 // Usa 0 come valore predefinito se Max è null
    const minTag = ctx.tags.find(t => t.id === limitCtrl.fields.Min)
    const min = minTag?.value?.value ?? 0 // Usa 0 come valore predefinito se Min è null
    setInputValue(set) // Imposta il valore corrente come valore iniziale
    setPopupData({
      ctrlName: ctrl.name,
      device: device,
      min: min,
      max: max,
      inputValueId: setCtrl.fields.InputValue,
    });
    setDialogVisible(true);
  };


  // Funzione per chiudere il popup
  const closeDialog = () => setDialogVisible(false);

  // Funzione per confermare il nuovo valore
  const confirmValue = () => {
    axios.post(`${serverIp}/api/mqtt/write`, { device: device, id: popupData.inputValueId, value: inputValue })
    closeDialog()
  };

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
        <g transform="scale(0.48) translate(0, 100)">
          <g transform="translate(50, 50)">
            {/* Blocchi PID */}
            <TestPoint label="Set" value={getRealValue(SetCtrl)} {...Setpoint}/>
            <Ramp {...SetpointRamp} />
            <TestPoint label="SetpointGradient" value={getSetValue(SetpointGradientCtrl)} {...SetpointGradient} onSetClick={() => openDialog(SetpointGradientCtrl)}/>
            <TestPoint label="Act" value={getRealValue(ActCtrl)} {...Actual}/>
            <TestPoint label="E" value={getRealValue(ErrorCtrl)} {...E}/>
            <TestPoint label="kP" value={getSetValue(kPCtrl)} {...kP} onSetClick={() => openDialog(kPCtrl)}/>
            <TestPoint label="kPE" value={getRealValue(kpErrorCtrl)} {...kPE}/>
            <TestPoint label="Td" value={getSetValue(TdCtrl)} {...Td} onSetClick={() => openDialog(TdCtrl)}/>
            <TestPoint label="dC" value={getRealValue(DerivativeCorrectionCtrl)} {...dC}/>
            <TestPoint label="Gp" value={getSetValue(GpCtrl)} {...Gp} onSetClick={() => openDialog(GpCtrl)}/>
            <TestPoint label="pC" value={getRealValue(ProportionalCorrectionCtrl)} {...pC}/>
            <TestPoint label="Ti" value={getSetValue(TiCtrl)} {...Ti} onSetClick={() => openDialog(TiCtrl)}/>
            <TestPoint label="iC" value={getRealValue(IntegralCorrectionCtrl)} {...iC}/>
            <TestPoint label="Taw" value={getSetValue(TawCtrl)} {...Taw} onSetClick={() => openDialog(TawCtrl)}/>
            <TestPoint label="awC" value={getRealValue(AntiWindupContributeCtrl)} {...awC}/>
            <TestPoint label="C" value={getRealValue(CorrectionCtrl)} {...C}/>
            <Saturation {...PidSat} />
            <TestPoint label="PidMax" value={getSetValue(PidMaxCtrl)} {...PidMax} onSetClick={() => openDialog(PidMaxCtrl)}/>
            <TestPoint label="PidMin" value={getSetValue(PidMinCtrl)} {...PidMin} onSetClick={() => openDialog(PidMinCtrl)}/>
            <TestPoint label="Reference" value={getRealValue(ReferenceCtrl)} {...Reference} />
            <TestPoint label="RawOut" value={getRealValue(RawOutCtrl)} {...RawOut} />
            <TestPoint label="ManualRef" value={getRealValue(ManualRefCtrl)} {...ManualRef} />
            <Switch2Way label="Mode" value={getBoolValue(ManualModeCtrl)} {...ManualMode} />
            <Switch2Way label="Stop" value={getBoolValue(StopCtrl)} {...Stop} />
            <Saturation {...OutSat} />
            <TestPoint label="OutMax" value={getSetValue(OutMaxCtrl)} {...OutMax} onSetClick={() => openDialog(OutMaxCtrl)}/>
            <TestPoint label="OutMin" value={getSetValue(OutMinCtrl)} {...OutMin} onSetClick={() => openDialog(OutMinCtrl)}/>
            <Ramp {...OutRamp} />
            <TestPoint label="OutGradient" value={getSetValue(OutGradientCtrl)} {...OutGradient} onSetClick={() => openDialog(OutGradientCtrl)}/>
            <TestPoint label="Out" value={getRealValue(OutCtrl)} {...Out} />

            {/* Connectors for PID logic (nuovo formato) */}
            {/* Setpoint → SetpointRamp */}
            <Connector start={{x: Setpoint.x + config.blockWidth, y: Setpoint.y}} offsets={[[config.blockDistanceX, 0]]} arrow />
            {/* SetpointGradient → SetpointRamp */}
            <Connector start={{x: SetpointGradient.x + config.blockWidth/2, y: SetpointGradient.y + config.blockWidth/2}} offsets={[[0, config.blockHeight]]} arrow />
            {/* SetpointRamp → E */}
            <Connector start={{x: SetpointRamp.x + 2*config.blockWidth, y: SetpointRamp.y}} offsets={[[config.blockDistanceX, 0]]} arrow />
            {/* Actual → E */}
            <Connector start={{x: Actual.x + config.blockWidth/2, y: Actual.y - config.blockHeight/2}} offsets={[[0, config.blockWidth - config.blockDistanceY]]} arrow />
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
            {/* Taw → awC */}
            <Connector start={{x: Taw.x + config.blockWidth, y: Taw.y}} offsets={[[config.blockDistanceX - config.blockWidth/2, 0]]} arrow />
            {/* awC → Node2 */}
            <Connector start={{x: awC.x + config.blockWidth, y: awC.y}} offsets={[[config.blockDistanceX, 0], [0, -3*config.blockDistanceY]]} arrow />
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
            {/* OutMax → OutSat */}
            <Connector start={{x: RawOut.x + 2*config.blockWidth + config.blockDistanceX, y: OutMax.y + config.blockHeight/2}} offsets={[[0, config.blockHeight]]} arrow />
            {/* OutMin → OutSat */}
            <Connector start={{x: RawOut.x + 2*config.blockWidth + config.blockDistanceX, y: OutMin.y - config.blockHeight/2}} offsets={[[0, -config.blockHeight]]} arrow />
            {/* OutSat → ManualMode */}
            <Connector start={{x: OutSat.x + 2*config.blockWidth, y: OutSat.y}} offsets={[[config.blockDistanceX, 0]]} arrow />
            {/* ManualMode → Stop */}
            <Connector start={{x: ManualMode.x + config.blockWidth, y: ManualMode.y}} offsets={[[config.blockDistanceX, 0]]} arrow />
            {/* ManualRef → ManualMode */}
            <Connector start={{x: ManualRef.x + config.blockWidth/2, y: ManualRef.y + config.blockHeight/2}} offsets={[[0, config.blockDistanceY - config.blockHeight]]} arrow />
            {/* Stop → OutRamp */}
            <Connector start={{x: Stop.x + config.blockWidth, y: Stop.y}} offsets={[[config.blockDistanceX, 0]]} arrow />
            {/* OutRamp → Out */}
            <Connector start={{x: OutRamp.x + 2*config.blockWidth, y: OutRamp.y}} offsets={[[config.blockDistanceX, 0]]} arrow />
            {/* OutGradient → OutRamp */}
            <Connector start={{x: OutGradient.x + 0.5*config.blockWidth, y: OutGradient.y + config.blockHeight/2}} offsets={[[0, config.blockHeight]]} arrow />
          </g>
        </g>
      </svg>
      {/* Popup dialog */}
      <SetPopup
        isDialogVisible={isDialogVisible}
        confirmValue={confirmValue}
        closeDialog={closeDialog}
        inputValue={inputValue}
        setInputValue={setInputValue}
        min={popupData.min}
        max={popupData.max}
        device={device}
        ctrlName={popupData.ctrlName}
      />
    </div>
  );
}

export default Pid;
