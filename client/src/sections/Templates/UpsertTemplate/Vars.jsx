import { Grid, GridCell } from '@react-md/utils'
import VarsList from './VarsList'
import gridStyles from "../../styles/Grid.module.scss"

function Vars() {
  return (
    <>
      <Grid>
        <GridCell colSpan={12} className={gridStyles.item}>
          <VarsList />
        </GridCell>
      </Grid>
    </>
  )
}

export default Vars