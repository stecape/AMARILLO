import { useContext } from "react"
import { Grid, GridCell } from '@react-md/utils'
import gridStyles from "../../styles/Grid.module.scss"
import {ctxData} from "../../Helpers/CtxProvider"
import LogicSelection from "../../HMI/Components/LogicSelection/LogicSelection"
import Set from "../../HMI/Components/Set/Set"
import Act from "../../HMI/Components/Act/Act"
import SetAct from "../../HMI/Components/SetAct/SetAct"

function Controls() {
  const ctx = useContext(ctxData)
  return (
    <>
      {ctx.init && (
        <Grid>
          <GridCell colSpan={4} className={gridStyles.item}>
            <LogicSelection ctrl={ctx.controls.Pot.Light} />
          </GridCell>
          <GridCell colSpan={4} className={gridStyles.item}>
            <Act ctrl={ctx.controls.Pot.BatteryLevel} />
          </GridCell>
          <GridCell colSpan={4} className={gridStyles.item}>
            <Set ctrl={ctx.controls.Pot.Temperature} />
          </GridCell>
          <GridCell colSpan={4} className={gridStyles.item}>
            <SetAct ctrl={ctx.controls.Pot.Pressure} />
          </GridCell>
        </Grid>
      )}
    </>
  )
}

export default Controls