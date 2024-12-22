import { Grid, GridCell } from '@react-md/utils'
//import TemplatesList from './TemplatesList'
import gridStyles from "../../styles/Grid.module.scss"

function Templates() {
  return (
    <>
      <Grid>
        <GridCell colSpan={12} className={gridStyles.item}>
          <pre>{` TODO:`}</pre>
          <pre>
            {
`  Un template sarà un tipo di dispositivo: es, un vaso, un termostato, un forno da pizza ecc...
  Nel template descrivi la sua struttura: tutte le variabili che riguardano un device di quel tipo.
  Poi da device andrai a creare un device di un determinato tipo dichiarando che template utilizzare.
  Dal device verranno quindi create le variabili e di conseguenza le tag.`
            }
          </pre>
        </GridCell>
      </Grid>
    </>
  )
}

export default Templates