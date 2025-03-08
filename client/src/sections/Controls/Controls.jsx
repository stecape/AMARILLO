import { Grid, GridCell } from '@react-md/utils'
import gridStyles from "../../styles/Grid.module.scss"
import LogicButton from "../../HMI/Components/LogicButton/LogicButton"

function Controls() {
  return (
    <>
      <Grid>
        <GridCell colSpan={6} className={gridStyles.item}>
          <LogicButton name="Test" left="ON" right="OFF"/>
        </GridCell>
      </Grid>
    </>
  )
}

export default Controls