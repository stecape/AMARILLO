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

  // filtro le variabili di allarme
  let alarmVars = ctx.vars.filter(t => t.type===alarmTypeId)

  // creo un array di oggetti allarme come mi viene comodo
  let alarms = alarmVars.map(al => {
    let alarmVar = ctx.vars.find(alV => alV.name === al.name)
    let alarmVarFields = ctx.tags.filter(alVarF => alVarF.var===alarmVar.id)
    let alarm = {}
    alarm.Name = alarmVar.name
    alarm.Description = alarmVar.comment
    alarm.Status = alarmVarFields.find(a => a.type_field===alarmStatusFieldId)?.value.value !== undefined ? alarmVarFields.find(a => a.type_field===alarmStatusFieldId).value.value : ""
    alarm.Reaction = alarmVarFields.find(a => a.type_field===alarmReactionFieldId)?.value.value !== undefined ? alarmVarFields.find(a => a.type_field===alarmReactionFieldId).value.value : ""
    let ts = alarmVarFields.find(a => a.type_field===alarmTsFieldId)
    let utc_offset = ctx.devices.find(d => d.id === alarmVar.device).utc_offset
    if (ts !== undefined && ts.value !== undefined && ts.value !== null) {
      const date = new Date(ts.value.value + utc_offset); // Converti il timestamp in millisecondi
      alarm.Ts = date.toLocaleString()
    } else {
      const date = new Date(0);
      alarm.Ts = date.toLocaleString()
    }
    return alarm
  })

  return(
    <>
      <TableContainer>
        <Table fullWidth>
          <TableHeader>
            <TableRow>
              <TableCell hAlign="left">TimeStamp</TableCell>
              <TableCell hAlign="left" style={{ minWidth: '200px' }}>Name</TableCell>
              <TableCell hAlign="left" grow>Description</TableCell>
              <TableCell hAlign="center">Reaction</TableCell>
              <TableCell hAlign="center">Status</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alarms
            .filter((alarm) => alarm.Status !== 0) // Filtra gli allarmi con Status diverso da 0
            .sort((a, b) => {
              const dateA = new Date(a.Ts).getTime()
              const dateB = new Date(b.Ts).getTime()
              return dateB - dateA // Ordina in ordine decrescente
            })
            .map((alarm) => {
              return (
                <TableRow key={alarm.Name}>
                  <TableCell className={tableStyles.cell} hAlign="left">{alarm.Ts}</TableCell>
                  <TableCell className={tableStyles.cell} hAlign="left">{alarm.Name}</TableCell>
                  <TableCell className={tableStyles.cell} hAlign="left">{alarm.Description}</TableCell>
                  <TableCell className={tableStyles.cell} hAlign="center">{alarm.Reaction}</TableCell>
                  <TableCell className={tableStyles.cell} hAlign="center">{alarm.Status}</TableCell> 
                </TableRow>
              )
            })}
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