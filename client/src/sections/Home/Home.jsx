import { useState, useContext } from "react"
import { Grid, GridCell } from '@react-md/utils'
import { DropdownMenu, MenuItem } from "@react-md/menu"
import { ctxData } from "../../Helpers/CtxProvider"
import gridStyles from "../../styles/Grid.module.scss"
import { TextContainer } from '@react-md/typography'

const basetypes = {
  Real: 'float',
  Int: 'int',
  Bool: 'bool',
  String: 'String',
  TimeStamp: 'time_t',
}

const IsBaseType = (x, data, types)=> {
  let sentence = {}
  sentence.type = data.find(d => d.id === x).type
  sentence.result = types.find(t => t.id === sentence.type).base_type
  return sentence
}

export default function Home() {
  const ctx = useContext(ctxData)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const devices = ctx.devices || []
  
  let structs = { types: [], vars: [], tagType: [], tagId: [], tagPointer: [] }

  //Generazione dei tipi di dati
  //Itera l'array dei tipi andando a cercare quelli complessi, e ritorna un array di oggetti contenenti nome del type e campi.
  //Verrà usato per generare la parte di codice C che va a definire i tipi di dati
  structs.types = ctx.types.filter(t => !t.base_type).map(type => {
    let fields = ctx.fields.filter(field => field.parent_type === type.id).map(f => {
      //Se è un tipo base ritorna la nomenclatura C prendendola dalle definizioni basetypes, se invece è un tipo complesso ritorna il nome del type:
      return { name: f.name, type: basetypes[ctx.types.find(t => t.id === f.type).name] !== undefined ? basetypes[ctx.types.find(t => t.id === f.type).name] : ctx.types.find(t => t.id === f.type).name }
    })
    return { name: type.name, fields: fields }
  })

  //Generazione delle istanze a partire dalla tabella delle Vars
  structs.vars = ctx.vars.filter(v => v.device === selectedDevice).map(v => {
    return { id: v.id, name: v.name, type: basetypes[ctx.types.find(t => t.id === v.type).name] !== undefined ? basetypes[ctx.types.find(t => t.id === v.type).name] : ctx.types.find(t => t.id === v.type).name }
  })

  
  structs.vars.forEach(v => {
    //le tag da inizializzare sono quelle la cui var è un tipo base oppure quelle il cui field type un tipo base (tagIsBaseType(t, ctx))
    let initTags = ctx.tags.filter(t => (t.var === v.id && t.type_field !== null && IsBaseType(t.type_field, ctx.fields, ctx.types).result) || (t.var === v.id && IsBaseType(v.id, ctx.vars, ctx.types).result))

    initTags.forEach(t => {
      let type = t.type_field !== null ? IsBaseType(t.type_field, ctx.fields, ctx.types).type : IsBaseType(v.id, ctx.vars, ctx.types).type
      structs.tagType.push(ctx.types.find(t => t.id === type).name.toUpperCase())
      structs.tagId.push(t.id)
      structs.tagPointer.push(`(void*)&HMI.${t.name}`)
    })
  })
  return (
    <>
      <Grid>
        <GridCell colSpan={12} className={gridStyles.item}>
          <DropdownMenu
            id="device-dropdown-menu"
            buttonChildren="Select Device"
            onClick={(event) => setSelectedDevice(event.currentTarget.textContent)}
          >
            {devices.map(device => (
              <MenuItem key={device.id} onClick={() => setSelectedDevice(device.id)}>
                {device.name}
              </MenuItem>
            ))}
          </DropdownMenu>
        </GridCell>
        {selectedDevice && (
          <>
            <GridCell colSpan={6} className={gridStyles.item}>
              <TextContainer style={{marginLeft: '1em'}}>
                <pre>
                  {'#ifndef HMI_h\n'}
                  {'#define HMI_h\n'}
                  {'\n#include "time.h"'}
                  {'\n#include <stdbool.h>\n'}
                  {'\n#define REAL 1'}
                  {'\n#define INT 3'}
                  {'\n#define BOOL 4'}
                  {'\n#define STRING 5'}
                  {'\n#define TIMESTAMP 6\n'}
                  {
                    structs.types.map(t => `\ntypedef struct {${t.fields.map(f => { return ("\n\t" + f.type + " " + f.name) }).join(";")};\n} ${t.name};\n`)
                  }
                  {`\ntypedef struct {`}
                  {
                    structs.vars.map(v => {
                      return (`\n\t${v.type} ${v.name};`)
                    })
                  }
                  {`\n} _HMI;`}
                  {`\nextern _HMI HMI;`}
                  {`\nextern _HMI PLC;`}
                  {'\n'}
                  {`\nextern int id[${structs.tagId.length}];`}
                  {`\nextern int type[${structs.tagType.length}];`}
                  {`\nextern void *HMI_pointer[${structs.tagPointer.length}];`}
                  {`\nextern void *PLC_pointer[${structs.tagPointer.length}];\n`}
                  {'\n#endif\n'}
                </pre>
              </TextContainer>
            </GridCell>
            <GridCell colSpan={6} className={gridStyles.item}>
              <TextContainer style={{marginLeft: '1em'}}>
                <pre>
                {'#include "HMI.h"\n'}
                {'\n_HMI HMI = {'}
                {
                  structs.vars.map(v => {
                    //le tag da inizializzare sono quelle la cui var è un tipo base oppure quelle il cui field type un tipo base (tagIsBaseType(t, ctx))
                    let initTags = ctx.tags.filter(t => (t.var === v.id && t.type_field !== null && IsBaseType(t.type_field, ctx.fields, ctx.types).result) || (t.var === v.id && IsBaseType(v.id, ctx.vars, ctx.types).result))

                    let inits = initTags.map(t => {
                      let type = t.type_field !== null ? IsBaseType(t.type_field, ctx.fields, ctx.types).type : IsBaseType(v.id, ctx.vars, ctx.types).type

                      switch(ctx.types.find(t => t.id === type).name){
                        case 'Real':
                          return `${"." + t.name.split('.').slice(1).join('.')} = 0,`
                        case 'Int':
                          return `${"." + t.name.split('.').slice(1).join('.')} = 0,`
                        case 'TimeStamp':
                          return `${"." + t.name.split('.').slice(1).join('.')} = 0,`
                        case 'Bool':
                          return `${"." + t.name.split('.').slice(1).join('.')} = false,`
                        case 'String':
                          return `${"." + t.name.split('.').slice(1).join('.')} = '',`
                        default:
                          return ''
                      }
                    })
                    return (`\n\t.${v.name} = {\n${inits.map(e => `\t\t${e}\n`).join("")}\t},`)
                  })
                }
                {'\n};'}
                {'\n'}
                {'\n_HMI PLC = {'}
                {
                  structs.vars.map(v => {
                    //le tag da inizializzare sono quelle la cui var è un tipo base oppure quelle il cui field type un tipo base (tagIsBaseType(t, ctx))
                    let initTags = ctx.tags.filter(t => (t.var === v.id && t.type_field !== null && IsBaseType(t.type_field, ctx.fields, ctx.types).result) || (t.var === v.id && IsBaseType(v.id, ctx.vars, ctx.types).result))

                    let inits = initTags.map(t => {
                      let type = t.type_field !== null ? IsBaseType(t.type_field, ctx.fields, ctx.types).type : IsBaseType(v.id, ctx.vars, ctx.types).type

                      switch(ctx.types.find(t => t.id === type).name){
                        case 'Real':
                          return `${"." + t.name.split('.').slice(1).join('.')} = 0,`
                        case 'Int':
                          return `${"." + t.name.split('.').slice(1).join('.')} = 0,`
                        case 'TimeStamp':
                          return `${"." + t.name.split('.').slice(1).join('.')} = 0,`
                        case 'Bool':
                          return `${"." + t.name.split('.').slice(1).join('.')} = false,`
                        case 'String':
                          return `${"." + t.name.split('.').slice(1).join('.')} = '',`
                        default:
                          return ''
                      }
                    })
                    return (`\n\t.${v.name} = {\n${inits.map(e => `\t\t${e}\n`).join("")}\t},`)
                  })
                }
                {'\n};'}
                {'\n'}
                {'\n'}
                {`\nint id[${structs.tagId.length}] = {\n\t${structs.tagId.join(`,\n\t`)}\n};\n`}
                {`\nint type[${structs.tagType.length}] = {\n\t${structs.tagType.join(`,\n\t`)}\n};\n`}
                {`\nvoid *HMI_pointer[${structs.tagPointer.length}] = {\n\t${structs.tagPointer.join(`,\n\t`)}\n};\n`}
                {`\nvoid *PLC_pointer[${structs.tagPointer.length}] = {\n\t${structs.tagPointer.join(`,\n\t`)}\n};\n`.replaceAll('&HMI', '&PLC')}
                </pre>
              </TextContainer>
            </GridCell>
          </>
        )}
      </Grid>
    </>
  )
}