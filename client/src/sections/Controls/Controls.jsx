import { useContext } from "react"
import { Grid, GridCell } from '@react-md/utils'
import gridStyles from "../../styles/Grid.module.scss"
import {ctxData} from "../../Helpers/CtxProvider"
import LogicSelection from "../../HMI/Components/LogicSelection/LogicSelection"

function Controls() {
  const ctx = useContext(ctxData)
  return (
    <>
      <Grid>
        <GridCell colSpan={6} className={gridStyles.item}>
          <LogicSelection ctrl={ctx.Controls.Light} />
        </GridCell>
      </Grid>
    </>
  )
}

export default Controls