import { useState, useContext } from "react";
import { Grid, GridCell } from "@react-md/utils";
import { Typography } from "@react-md/typography";
import { Dialog, DialogContent, DialogFooter } from "@react-md/dialog";
import { Button } from "@react-md/button";
import { TextField } from "@react-md/form";
import styles from "./Profile.module.scss";
import { ctxData } from "../../../Helpers/CtxProvider";
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
import Bar from "../Bar/Bar";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PAIRS = 6;

function Profile(props) {
  const ctx = useContext(ctxData);
  // Estraggo i valori delle tag
  const getTagValue = (base, idx) => {
    const tag = ctx.tags.find((t) => t.name === `Forno.Profile.${base}._${idx}`);
    return tag?.value?.value ?? 0;
  };
  const [editIdx, setEditIdx] = useState(null); // {type: 'Time'|'Value', idx: number}
  const [inputValue, setInputValue] = useState(0);

  // Preparo i dati
  const times = Array.from({ length: PAIRS }, (_, i) => getTagValue("Times", i));
  const values = Array.from({ length: PAIRS }, (_, i) => getTagValue("Values", i));

  // Chart data
  const chartData = {
    labels: times,
    datasets: [
      {
        label: "Temperatura",
        data: values,
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
      title: { display: true, text: "Profilo Temperatura" },
    },
    scales: {
      x: { title: { display: true, text: "Tempo (s)" } },
      y: { title: { display: true, text: "Temperatura (°C)" } },
    },
  };

  // Gestione popup
  const handleEdit = (type, idx) => {
    setEditIdx({ type, idx });
    setInputValue(type === "Time" ? times[idx] : values[idx]);
  };
  const handleClose = () => setEditIdx(null);
  const handleConfirm = () => {
    if (!editIdx) return;
    // Determina la tag da scrivere
    const tagName = `Forno.Profile.${editIdx.type === 'Time' ? 'Times' : 'Values'}._${editIdx.idx}`;
    const tag = ctx.tags.find(t => t.name === tagName);
    if (tag) {
      // Scrivi il valore tramite API MQTT (come Set.jsx)
      const serverIp = process.env.REACT_APP_SERVER_IP || "http://localhost:3001";
      fetch(`${serverIp}/api/mqtt/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device: tag.device, id: tag.id, value: inputValue })
      });
    }
    setEditIdx(null);
  };

  // Limiti per il popup
  const min = editIdx?.type === "Time"
    ? ctx.tags.find(t => t.name === `Forno.Profile.Times._${editIdx?.idx}`)?.min ?? 0
    : ctx.tags.find(t => t.name === `Forno.Profile.Values._${editIdx?.idx}`)?.min ?? 0;
  const max = editIdx?.type === "Time"
    ? ctx.tags.find(t => t.name === `Forno.Profile.Times._${editIdx?.idx}`)?.max ?? 1000
    : ctx.tags.find(t => t.name === `Forno.Profile.Values._${editIdx?.idx}`)?.max ?? 500;

  return (
    <div className={styles.profileBlockWrapper}>
      <Grid>
        <GridCell colSpan={3}>
          <Typography type="headline-6" color="secondary" style={{ marginTop: 0, marginBottom: "2rem" }}>
            Forno - TemperatureProfile
          </Typography>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {Array.from({ length: PAIRS }, (_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "2rem",
                  alignItems: "center",
                }}
              >
                <span style={{ minWidth: 60 }}>Punto {i + 1}</span>
                <span
                  style={{ cursor: "pointer", color: "#c7a926" }}
                  onClick={() => handleEdit("Time", i)}
                >
                  {times[i]}{" "}
                  <span style={{ fontSize: 12, color: "#888" }}>s</span>
                </span>
                <span
                  style={{ cursor: "pointer", color: "#c7a926" }}
                  onClick={() => handleEdit("Value", i)}
                >
                  {values[i]}{" "}
                  <span style={{ fontSize: 12, color: "#888" }}>°C</span>
                </span>
              </div>
            ))}
          </div>
        </GridCell>
        <GridCell colSpan={9}>
          <div className={styles.profileBlockSvg} style={{ width: "100%", height: 300, minWidth: 0 }}>
            <Line
              data={chartData}
              options={{ ...chartOptions, responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </GridCell>
      </Grid>
      {/* Popup per edit */}
      <Dialog
        id="profile-set-dialog"
        visible={!!editIdx}
        onRequestClose={handleClose}
        aria-labelledby="profile-set-dialog-title"
      >
        <DialogContent>
          <Typography
            id="profile-set-dialog-title"
            type="headline-6"
            margin="none"
          >
            {editIdx?.type === "Time" ? "Tempo" : "Temperatura"} punto{" "}
            {editIdx?.idx + 1}
          </Typography>
          <TextField
            id="profile-set-input"
            label={
              editIdx?.type === "Time"
                ? "Tempo (s)"
                : "Temperatura (°C)"
            }
            type="number"
            value={inputValue}
            min={min}
            max={max}
            onChange={(e) => setInputValue(Number(e.target.value) || 0)}
            className={styles.dialogInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirm();
            }}
          />
          <Bar set={inputValue} min={min} max={max} />
        </DialogContent>
        <DialogFooter>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleConfirm} theme="primary">
            Set
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Profile;
