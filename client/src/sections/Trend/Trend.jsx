import { useContext, useEffect, useState, useRef } from "react"; // Aggiunto useRef
import { Grid, GridCell } from '@react-md/utils';
import { Button } from "@react-md/button"
import { DialogContent, DialogFooter } from "@react-md/dialog"
import { Typography } from "@react-md/typography";
import {
  Form,
  FormThemeProvider,
  Select
} from '@react-md/form'
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import gridStyles from "../../styles/Grid.module.scss";
import styles from "./Trend.module.scss";
import { ctxData } from "../../Helpers/CtxProvider";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MAX_BUFFER = 1000;

const intervalOptions = [
  { label: '100ms', value: 100 },
  { label: '250ms', value: 250 },
  { label: '500ms', value: 500 },
  { label: '1s', value: 1000 },
  { label: '5s', value: 5000 },
  { label: '10s', value: 10000 },
  { label: '30s', value: 30000 },
  { label: '1m', value: 60000 },
  { label: '5m', value: 300000 },
  { label: '10m', value: 600000 },
  { label: '30m', value: 1800000 },
  { label: '1h', value: 3600000 },
];

function Trend() {
  const ctx = useContext(ctxData);
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedTag2, setSelectedTag2] = useState(null);
  const [selectedTag3, setSelectedTag3] = useState(null);
  const [interval, setIntervalMs] = useState(1000);
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(false); // Aggiunto stato per il trigger di aggiornamento
  const timerRef = useRef(null); // Aggiunto riferimento per il timer
  const [isRecording, setIsRecording] = useState(false); // Stato per la registrazione

  const startRecording = () => {
    setData([]); // Resetta i dati quando si avvia la registrazione
    setData2([]);
    setData3([]);
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Mantiene i dati per l'analisi dopo lo stop
  };

  // Ottieni la lista delle tag di tipo base disponibili
  const tags = ctx.tags.filter(t => {
    const tag_type_field_type = ctx.fields.find(f => f.id === t.type_field)
    if (!tag_type_field_type) return false; // Se non esiste il tipo di campo, salta questo tag
    return ctx.types.find(ty => ty.id === tag_type_field_type.type)?.base_type === true
  }) || [];
console.log("Tags:", tags);
console.log("Ctx.tags:", ctx.tags);
  // Gestione polling
  useEffect(() => {
    if (!isRecording || !selectedTag) return;

    if (timerRef.current) clearInterval(timerRef.current); // Cancella il timer precedente

    timerRef.current = setInterval(() => {
      setUpdateTrigger(prev => !prev); // Cambia lo stato per forzare il re-render
    }, interval);

    return () => clearInterval(timerRef.current); // Pulisce il timer quando il componente si smonta o l'effetto si aggiorna
  }, [isRecording, selectedTag, interval]);

  // Reset dati quando cambio tag
  useEffect(() => { setData([]); }, [selectedTag, interval]);

  // Aggiorna i dati ogni volta che il trigger di aggiornamento cambia
  useEffect(() => {
    if (!isRecording || !selectedTag) return;
    setData(prev => {
      const value = ctx.tags.find(t => t.id === selectedTag.id)?.value?.value ?? 0;
      const newEntry = { time: new Date().toLocaleTimeString('it-IT', { hour12: false }) + ':' + new Date().getMilliseconds(), value };
      const arr = [...prev, newEntry];
      return arr.length > MAX_BUFFER ? arr.slice(arr.length - MAX_BUFFER) : arr;
    });
    if (selectedTag2) {
      setData2(prev => {
        const value = ctx.tags.find(t => t.id === selectedTag2.id)?.value?.value ?? 0;
        const newEntry = { time: new Date().toLocaleTimeString('it-IT', { hour12: false }) + ':' + new Date().getMilliseconds(), value };
        const arr = [...prev, newEntry];
        return arr.length > MAX_BUFFER ? arr.slice(arr.length - MAX_BUFFER) : arr;
      });
    }
    if (selectedTag3) {
      setData3(prev => {
        const value = ctx.tags.find(t => t.id === selectedTag3.id)?.value?.value ?? 0;
        const newEntry = { time: new Date().toLocaleTimeString('it-IT', { hour12: false }) + ':' + new Date().getMilliseconds(), value };
        const arr = [...prev, newEntry];
        return arr.length > MAX_BUFFER ? arr.slice(arr.length - MAX_BUFFER) : arr;
      });
    }
  }, [updateTrigger, isRecording, selectedTag, selectedTag2, selectedTag3]);

  const chartData = {
    labels: data.map((point) => point.time),
    datasets: [
      {
        label: 'Value',
        data: data.map((point) => point.value),
        borderColor: 'rgb(199, 169, 38)',
        backgroundColor: 'rgba(199, 169, 38, 0.2)',
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Serie 2',
        data: data2.map((point) => point.value),
        borderColor: '#fff',
        backgroundColor: 'rgba(255,255,255,0.2)',
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Serie 3',
        data: data3.map((point) => point.value),
        borderColor: '#7B3F00', // marrone
        backgroundColor: 'rgba(123,63,0,0.2)',
        tension: 0.4,
        yAxisID: 'y2',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Trend Data',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Value',
        },
        position: 'left',
      },
      y2: {
        title: {
          display: true,
          text: 'Serie 3',
        },
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <Grid>
      <GridCell colSpan={12} className={gridStyles.item}>
        <Typography
          id="dialog-title"
          type="headline-6"
          margin="none"
          color="secondary"
          className={styles.title}
        >
          Trend
        </Typography>

        <FormThemeProvider theme="outline">
          <Form>
            <DialogContent>
              <Select
                id="tag"
                key="tag"
                options={tags.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
                value={selectedTag?.id.toString() || ''}
                label="Tag 1"
                onChange={(value) => {
                  const t = tags.find((t) => t.id === Number(value));
                  setSelectedTag(t);
                }}
              />
              <Select
                id="tag2"
                key="tag2"
                options={tags.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
                value={selectedTag2?.id?.toString() || ''}
                label="Tag 2"
                onChange={(value) => {
                  const t = tags.find((t) => t.id === Number(value));
                  setSelectedTag2(t);
                }}
              />
              <Select
                id="tag3"
                key="tag3"
                options={tags.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
                value={selectedTag3?.id?.toString() || ''}
                label="Tag 3"
                onChange={(value) => {
                  const t = tags.find((t) => t.id === Number(value));
                  setSelectedTag3(t);
                }}
              />
              <Select
                id="interval"
                key="interval"
                options={intervalOptions.map((item) => ({
                  label: item.label,
                  value: item.value,
                }))}
                value={interval !== null && interval.toString()}
                label="Interval"
                onChange={(value) => setIntervalMs(Number(value))}
              />
            </DialogContent>
            <DialogFooter>
              <Button
                id="button-start-recording"
                onClick={startRecording}
                disabled={isRecording}
              >
                Start Recording
              </Button>
              <Button
                id="button-stop-recording"
                onClick={stopRecording}
                disabled={!isRecording}
              >
                Stop Recording
              </Button>
            </DialogFooter>
          </Form>
        </FormThemeProvider>
        <div style={{ width: '100%', height: '700px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </GridCell>
    </Grid>
  );
}

export default Trend;