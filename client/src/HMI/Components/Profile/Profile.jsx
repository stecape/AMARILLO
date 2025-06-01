import { useState, useContext } from "react";
import { Grid, GridCell } from "@react-md/utils";
import { Typography } from "@react-md/typography";
import styles from "./Profile.module.scss";
import { ctxData } from "../../../Helpers/CtxProvider";
import axios from 'axios'
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import SetPopup from "../SetPopup/SetPopup";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Profile(props) {
  const serverIp = process.env.REACT_APP_SERVER_IP || "http://localhost:3001";

  const [isDialogVisible, setDialogVisible] = useState(false)
  const [popupData, setPopupData] = useState({})
  const [inputValue, setInputValue] = useState("")
  const ctx = useContext(ctxData);

  // Recupera il nome del dispositivo
  const device = ctx.devices.find(d => d.id === props.ctrl.device)?.name || "Unknown Device";

  // Recupera i controls di times e values
  const timesCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.Times)
  const valuesCtrl = Object.values(ctx.controls[device]).find(control => control.id === props.ctrl.fields.Values)
  
  // Times Set Ctrl
  const time_0_Set_Parent_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === timesCtrl.fields._0)
  const time_0_Set_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === time_0_Set_Parent_Ctrl.fields.Set)
  const time_0_value = ctx.tags.find(t => t.id === time_0_Set_Ctrl.fields.Value)?.value?.value || 0;
  const time_1_Set_Parent_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === timesCtrl.fields._1)
  const time_1_Set_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === time_1_Set_Parent_Ctrl.fields.Set)
  const time_1_value = ctx.tags.find(t => t.id === time_1_Set_Ctrl.fields.Value)?.value?.value || 0;
  const time_2_Set_Parent_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === timesCtrl.fields._2)
  const time_2_Set_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === time_2_Set_Parent_Ctrl.fields.Set)
  const time_2_value = ctx.tags.find(t => t.id === time_2_Set_Ctrl.fields.Value)?.value?.value || 0;
  const time_3_Set_Parent_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === timesCtrl.fields._3)
  const time_3_Set_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === time_3_Set_Parent_Ctrl.fields.Set)
  const time_3_value = ctx.tags.find(t => t.id === time_3_Set_Ctrl.fields.Value)?.value?.value || 0;
  const time_4_Set_Parent_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === timesCtrl.fields._4)
  const time_4_Set_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === time_4_Set_Parent_Ctrl.fields.Set)
  const time_4_value = ctx.tags.find(t => t.id === time_4_Set_Ctrl.fields.Value)?.value?.value || 0;
  const time_5_Set_Parent_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === timesCtrl.fields._5)
  const time_5_Set_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === time_5_Set_Parent_Ctrl.fields.Set)
  const time_5_value = ctx.tags.find(t => t.id === time_5_Set_Ctrl.fields.Value)?.value?.value || 0;
  
  // Values Set Ctrl
  const value_0_Set_Parent_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === valuesCtrl.fields._0)
  const value_0_Set_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === value_0_Set_Parent_Ctrl.fields.Set)
  const value_0_value = ctx.tags.find(t => t.id === value_0_Set_Ctrl.fields.Value)?.value?.value || 0;
  const value_1_Set_Parent_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === valuesCtrl.fields._1)
  const value_1_Set_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === value_1_Set_Parent_Ctrl.fields.Set)
  const value_1_value = ctx.tags.find(t => t.id === value_1_Set_Ctrl.fields.Value)?.value?.value || 0;
  const value_2_Set_Parent_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === valuesCtrl.fields._2)
  const value_2_Set_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === value_2_Set_Parent_Ctrl.fields.Set)
  const value_2_value = ctx.tags.find(t => t.id === value_2_Set_Ctrl.fields.Value)?.value?.value || 0;
  const value_3_Set_Parent_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === valuesCtrl.fields._3)
  const value_3_Set_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === value_3_Set_Parent_Ctrl.fields.Set)
  const value_3_value = ctx.tags.find(t => t.id === value_3_Set_Ctrl.fields.Value)?.value?.value || 0;
  const value_4_Set_Parent_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === valuesCtrl.fields._4)
  const value_4_Set_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === value_4_Set_Parent_Ctrl.fields.Set)
  const value_4_value = ctx.tags.find(t => t.id === value_4_Set_Ctrl.fields.Value)?.value?.value || 0;
  const value_5_Set_Parent_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === valuesCtrl.fields._5)
  const value_5_Set_Ctrl = Object.values(ctx.controls[device]).find(control => control.id === value_5_Set_Parent_Ctrl.fields.Set)
  const value_5_value = ctx.tags.find(t => t.id === value_5_Set_Ctrl.fields.Value)?.value?.value || 0;

  // Chart data (x: time, y: value)
  const chartData = {
    datasets: [
      {
        label: "Temperature Profile",
        data: [
          { x: time_0_value, y: value_0_value },
          { x: time_1_value, y: value_1_value },
          { x: time_2_value, y: value_2_value },
          { x: time_3_value, y: value_3_value },
          { x: time_4_value, y: value_4_value },
          { x: time_5_value, y: value_5_value },
        ],
        borderColor: "rgb(199, 169, 38)",
        backgroundColor: "rgba(199, 169, 38, 0.2)",
        tension: 0.4,
      },
    ],
  };
  const chartOptions = {
    responsive: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Temperature Profile" },
    },
    scales: {
      x: {
        type: "linear",
        title: { display: true, text: "Time (s)" },
        beginAtZero: true,
      },
      y: { title: { display: true, text: "Temperature (°C)" } },
    },
  };

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
    console.log("Opening dialog for control:", ctrl.name, "with device:", device);
    console.log("setCtrl:", setCtrl)
    setDialogVisible(true);
  };

  const closeDialog = () => setDialogVisible(false);

  // Funzione per confermare il nuovo valore
  const confirmValue = () => {
    axios.post(`${serverIp}/api/mqtt/write`, { device: device, id: popupData.inputValueId, value: inputValue })
    closeDialog()
  };


  return (
    <div className={styles.profileBlockWrapper}>
      <Grid>
        <GridCell colSpan={3}>
          <Typography type="headline-6" color="secondary" style={{ marginTop: 0, marginBottom: "2rem" }}>
            {`${device} - TemperatureProfile`}
          </Typography>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div key="profile0" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                <span style={{ minWidth: 60 }}>Point 0</span>
                <span style={{ cursor: "pointer", color: "#c7a926" }} onClick={() => openDialog(time_0_Set_Parent_Ctrl)}>
                  {time_0_value} <span style={{ fontSize: 12, color: "#888" }}>s</span>
                </span>
                <span style={{ cursor: "pointer", color: "#c7a926" }} onClick={() => openDialog(value_0_Set_Parent_Ctrl)}>
                  {value_0_value} <span style={{ fontSize: 12, color: "#888" }}>°C</span>
                </span>
              </div>
              <div key="profile1" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                <span style={{ minWidth: 60 }}>Point 1</span>
                <span style={{ cursor: "pointer", color: "#c7a926" }} onClick={() => openDialog(time_1_Set_Parent_Ctrl)}>
                  {time_1_value} <span style={{ fontSize: 12, color: "#888" }}>s</span>
                </span>
                <span style={{ cursor: "pointer", color: "#c7a926" }} onClick={() => openDialog(value_1_Set_Parent_Ctrl)}>
                  {value_1_value} <span style={{ fontSize: 12, color: "#888" }}>°C</span>
                </span>
              </div>
              <div key="profile2" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                <span style={{ minWidth: 60 }}>Point 2</span>
                <span style={{ cursor: "pointer", color: "#c7a926" }} onClick={() => openDialog(time_2_Set_Parent_Ctrl)}>
                  {time_2_value} <span style={{ fontSize: 12, color: "#888" }}>s</span>
                </span>
                <span style={{ cursor: "pointer", color: "#c7a926" }} onClick={() => openDialog(value_2_Set_Parent_Ctrl)}>
                  {value_2_value} <span style={{ fontSize: 12, color: "#888" }}>°C</span>
                </span>
              </div>
              <div key="profile3" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                <span style={{ minWidth: 60 }}>Point 3</span>
                <span style={{ cursor: "pointer", color: "#c7a926" }} onClick={() => openDialog(time_3_Set_Parent_Ctrl)}>
                  {time_3_value} <span style={{ fontSize: 12, color: "#888" }}>s</span>
                </span>
                <span style={{ cursor: "pointer", color: "#c7a926" }} onClick={() => openDialog(value_3_Set_Parent_Ctrl)}>
                  {value_3_value} <span style={{ fontSize: 12, color: "#888" }}>°C</span>
                </span>
              </div>
              <div key="profile4" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                <span style={{ minWidth: 60 }}>Point 4</span>
                <span style={{ cursor: "pointer", color: "#c7a926" }} onClick={() => openDialog(time_4_Set_Parent_Ctrl)}>
                  {time_4_value} <span style={{ fontSize: 12, color: "#888" }}>s</span>
                </span>
                <span style={{ cursor: "pointer", color: "#c7a926" }} onClick={() => openDialog(value_4_Set_Parent_Ctrl)}>
                  {value_4_value} <span style={{ fontSize: 12, color: "#888" }}>°C</span>
                </span>
              </div>
              <div key="profile5" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                <span style={{ minWidth: 60 }}>Point 5</span>
                <span style={{ cursor: "pointer", color: "#c7a926" }} onClick={() => openDialog(time_5_Set_Parent_Ctrl)}>
                  {time_5_value} <span style={{ fontSize: 12, color: "#888" }}>s</span>
                </span>
                <span style={{ cursor: "pointer", color: "#c7a926" }} onClick={() => openDialog(value_5_Set_Parent_Ctrl)}>
                  {value_5_value} <span style={{ fontSize: 12, color: "#888" }}>°C</span>
                </span>
              </div>
          </div>
        </GridCell>
        <GridCell colSpan={9}>
          <div className={styles.profileBlockSvg} style={{ width: "100%", height: 300, minWidth: 0 }}>
            <Line data={chartData} options={{ ...chartOptions, responsive: true, maintainAspectRatio: false }} />
          </div>
        </GridCell>
      </Grid>
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

export default Profile;
