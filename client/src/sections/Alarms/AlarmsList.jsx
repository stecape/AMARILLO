import { useContext } from "react"
import { Button } from "@react-md/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableContainer
} from '@react-md/table'
import { CheckCircleSVGIcon } from "@react-md/material-icons"
import {ctxData} from "../../Helpers/CtxProvider"
import tableStyles from '../../styles/Table.module.scss'
import axios from "axios"

function AlarmsList () {
  // Usa la variabile d'ambiente per configurare l'URL del server
  const serverIp = process.env.REACT_APP_SERVER_IP || "http://localhost:3001"
  const ctx = useContext(ctxData)
  // Recupero gli ID dei tipi e dei campi necessari
  let alarmTypeId = ctx.types.find(t => t.name==="Alarm")?.id || 0
  let alarmStatusFieldId = ctx.fields.find(t => t.parent_type === alarmTypeId && t.name==="Status")?.id || 0
  let alarmReactionFieldId = ctx.fields.find(t => t.parent_type === alarmTypeId && t.name==="Reaction")?.id || 0
  let alarmTsFieldId = ctx.fields.find(t => t.parent_type === alarmTypeId && t.name==="Ts")?.id || 0


  // Semplificare il controllo utilizzando direttamente tag.type === alarmTypeId
  let alarms = ctx.devices.map(device => {
    // filtro le variabili di allarme del dispositivo corrente
    let alarmVars = ctx.vars.filter(v => v.type === alarmTypeId && v.template === device.template);
    let deviceAlarms = alarmVars.map(al => {
      let alarm = {};
      let alarmTags = ctx.tags.filter(t => t.var === al.id && t.device === device.id && t.type_field !== null);

      alarm.Device = device.name;
      alarm.Name = al.name;
      alarm.Description = al.comment;
      alarm.Reaction = alarmTags.find(t => t.type_field === alarmReactionFieldId)?.value?.value ?? "";
      alarm.Status = alarmTags.find(t => t.type_field === alarmStatusFieldId)?.value?.value ?? "";

      let ts = alarmTags.find(t => t.type_field === alarmTsFieldId);
      let utc_offset = device.utc_offset || 0; // Usa l'offset UTC del dispositivo, se disponibile
      console.log("device: ", device.name, "utc_offset: ", utc_offset)
      ts !== undefined && ts.value !== undefined && ts.value !== null ?
        alarm.Ts = new Date(Number(ts.value.value) + Number(utc_offset)).toLocaleString()
        :
        alarm.Ts = new Date(0).toLocaleString();

      return alarm;
    })
    return { device: device.name, alarms: deviceAlarms };
  })
  console.log("alarms: ", alarms)
  return(
    <>
      <TableContainer>
        <Table fullWidth>
          <TableHeader>
            <TableRow>
            <TableCell hAlign="left">Device</TableCell>
            <TableCell hAlign="left" style={{ minWidth: '200px' }}>TimeStamp</TableCell>
              <TableCell hAlign="left" style={{ minWidth: '200px' }}>Name</TableCell>
              <TableCell hAlign="left" grow>Description</TableCell>
              <TableCell hAlign="center">Reaction</TableCell>
              <TableCell hAlign="center">Status</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alarms.map(({ device, alarms }) => 
              alarms
              .filter((alarm) => alarm.Status) // Filtra gli allarmi con Status diverso da 0, "" o null
              .sort((a, b) => {
                const dateA = new Date(a.Ts).getTime()
                const dateB = new Date(b.Ts).getTime()
                return dateB - dateA // Ordina in ordine decrescente
              })
              .map((alarm) => {
                return (
                  <TableRow key={`${device}-${alarm.Name}`}>
                    <TableCell className={tableStyles.cell} hAlign="left">{device}</TableCell>
                    <TableCell className={tableStyles.cell} hAlign="left">{alarm.Ts}</TableCell>
                    <TableCell className={tableStyles.cell} hAlign="left">{alarm.Name}</TableCell>
                    <TableCell className={tableStyles.cell} hAlign="left">{alarm.Description}</TableCell>
                    <TableCell className={tableStyles.cell} hAlign="center">{alarm.Reaction}</TableCell>
                    <TableCell className={tableStyles.cell} hAlign="center">{alarm.Status}</TableCell> 
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Button 
        floating="bottom-right" 
        
        onClick={() => axios.post(`${serverIp}/api/mqtt/alarms_ack`)}
      >
        <CheckCircleSVGIcon />
      </Button>
    </>
  )}
export default AlarmsList