import { useContext } from "react"
import { Grid, GridCell } from '@react-md/utils'
import { Button } from "@react-md/button"
import { ctxData } from "../../Helpers/CtxProvider"
import gridStyles from "../../styles/Grid.module.scss"
import { TextContainer } from '@react-md/typography'
import axios from 'axios'

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

export default function NoPage() {
  const ctx = useContext(ctxData)
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
  structs.vars = ctx.vars.map(v => {
    return { id: v.id, name: v.name, type: basetypes[ctx.types.find(t => t.id === v.type).name] !== undefined ? basetypes[ctx.types.find(t => t.id === v.type).name] : ctx.types.find(t => t.id === v.type).name }
  })

  
  structs.vars.forEach(v => {
    //le tag da inizializzare sono quelle la cui var è un tipo base oppure quelle il cui field type un tipo base (tagIsBaseType(t, ctx))
    let initTags = ctx.tags.filter(t => (t.var === v.id && t.type_field !== null && IsBaseType(t.type_field, ctx.fields, ctx.types).result) || (t.var === v.id && IsBaseType(v.id, ctx.vars, ctx.types).result))

    initTags.forEach(t => {
      let type = t.type_field !== null ? IsBaseType(t.type_field, ctx.fields, ctx.types).type : IsBaseType(v.id, ctx.vars, ctx.types).type
      structs.tagType.push(ctx.types.find(t => t.id === type).name.toUpperCase())
      structs.tagId.push(t.id)
      structs.tagPointer.push(`(void*)&${t.name}`)
    })
  })
  return (
    <>
      <Grid>
        <GridCell colSpan={6} className={gridStyles.item}>
          <TextContainer style={{marginLeft: '1em'}}>
            <pre>
              {'\n#define REAL 1'}
              {'\n#define INT 3'}
              {'\n#define BOOL 4'}
              {'\n#define STRING 5'}
              {'\n#define TIMESTAMP 6\n'}
              {
                structs.types.map(t => `\ntypedef struct {${t.fields.map(f => { return ("\n\t" + f.type + " " + f.name) })}\n} ${t.name};\n`)
              }
            </pre>
          </TextContainer>
        </GridCell>
        <GridCell colSpan={6} className={gridStyles.item}>
          <TextContainer style={{marginLeft: '1em'}}>
            <pre>
            {
              structs.vars.map(v => {
                //le tag da inizializzare sono quelle la cui var è un tipo base oppure quelle il cui field type un tipo base (tagIsBaseType(t, ctx))
                let initTags = ctx.tags.filter(t => (t.var === v.id && t.type_field !== null && IsBaseType(t.type_field, ctx.fields, ctx.types).result) || (t.var === v.id && IsBaseType(v.id, ctx.vars, ctx.types).result))

                let inits = initTags.map(t => {
                  let type = t.type_field !== null ? IsBaseType(t.type_field, ctx.fields, ctx.types).type : IsBaseType(v.id, ctx.vars, ctx.types).type

                  switch(ctx.types.find(t => t.id === type).name){
                    case 'Real':
                      return `${t.name} = 0;`
                    case 'Int':
                      return `${t.name} = 0;`
                    case 'TimeStamp':
                      return `${t.name} = 0;`
                    case 'Bool':
                      return `${t.name} = false;`
                    case 'String':
                      return `${t.name} = '';`
                    default:
                      return ''
                  }
                })
                return (`\n${v.type} ${v.name};\n${inits.map(e => `${e} \n`).join("")}`)
              })
            }
            </pre>
          </TextContainer>
        </GridCell>
        <GridCell colSpan={4} className={gridStyles.item}>
          <TextContainer style={{marginLeft: '1em'}}>
            <pre>
              {`int id[${structs.tagId.length}] = {\n\t${structs.tagId.join(`,\n\t`)}\n};`}
            </pre>
          </TextContainer>
        </GridCell>
        <GridCell colSpan={4} className={gridStyles.item}>
          <TextContainer style={{marginLeft: '1em'}}>
            <pre>
              {`int type[${structs.tagType.length}] = {\n\t${structs.tagType.join(`,\n\t`)}\n};`}
            </pre>
          </TextContainer>
        </GridCell>
        <GridCell colSpan={4} className={gridStyles.item}>
          <TextContainer style={{marginLeft: '1em'}}>
            <pre>
              {`void *pointer[${structs.tagPointer.length}] = {\n\t${structs.tagPointer.join(`,\n\t`)}\n};`}
            </pre>
          </TextContainer>
        </GridCell>
        <GridCell colSpan={4} className={gridStyles.item}>
          <Button onClick={() => axios.post('http://localhost:3001/api/mqtt/write', {id: 5, value: 123.4})}>Test Send</Button>
        </GridCell>
      </Grid>
    </>
  )
}