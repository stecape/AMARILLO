import { useContext, useEffect, useState, useRef } from "react"; // Aggiunto useRef
import { Grid, GridCell } from '@react-md/utils';
import { Button } from "@react-md/button"
import { Dialog, DialogContent, DialogFooter } from "@react-md/dialog"
import { Typography } from "@react-md/typography";
import {
  Form,
  TextField,
  FormThemeProvider,
  Select
} from '@react-md/form'
import gridStyles from "../../styles/Grid.module.scss";
import styles from "./Trend.module.scss";
import { ctxData } from "../../Helpers/CtxProvider";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

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
  const [interval, setIntervalMs] = useState(1000);
  const [data, setData] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(false); // Aggiunto stato per il trigger di aggiornamento
  const timerRef = useRef(null); // Aggiunto riferimento per il timer
  const [isRecording, setIsRecording] = useState(false); // Stato per la registrazione

  const startRecording = () => {
    setData([]); // Resetta i dati quando si avvia la registrazione
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Mantiene i dati per l'analisi dopo lo stop
  };

  // Ottieni la lista delle tag di tipo base disponibili
  const tags = ctx.tags.filter(t => ctx.types.find(ty => ty.id === t.type_field)?.base_type === true) || [];

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
    // Aggiorna i dati con il valore corrente della tag selezionata
    setData(prev => {
      const value = ctx.tags.find(t => t.id === selectedTag.id)?.value?.value ?? 0;
      const newEntry = { time: new Date().toLocaleTimeString('it-IT', { hour12: false }) + ':' + new Date().getMilliseconds(), value };
      const arr = [...prev, newEntry];
      return arr.length > MAX_BUFFER ? arr.slice(arr.length - MAX_BUFFER) : arr;
    });
  }, [updateTrigger, isRecording, selectedTag]);

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

        <FormThemeProvider theme='outline'>
          <Form>
            <DialogContent>
              <Select
                id='tag'
                key='tag'
                options={tags.map((item) => ({
                  label: item.name,
                  value: item.id
                }))}
                value={selectedTag?.id.toString() || ''}
                label="Tag"
                onChange={value => {
                  const t = tags.find(t => t.id === Number(value));
                  setSelectedTag(t);
                }}
              />
              <Select
                id='interval'
                key='interval'
                options={intervalOptions.map((item) => ({
                  label: item.label,
                  value: item.value
                }))}
                value={interval !== null && interval.toString()}
                label="Interval"
                onChange={value => setIntervalMs(Number(value))}
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
        <div>
          {/* {containerReady && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" minTickGap={40} />
                <YAxis allowDecimals domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#1976d2" dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          )} */
          JSON.stringify({data: data[data.length - 1], index: data.length - 1})
          }
        </div>
      </GridCell>
    </Grid>
  );
}

export default Trend;