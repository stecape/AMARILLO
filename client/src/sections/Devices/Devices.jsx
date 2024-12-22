import { Grid, GridCell } from '@react-md/utils'
import DevicesList from './DevicesList'
import gridStyles from "../../styles/Grid.module.scss"

function Devices() {
  return (
    <>
      <Grid>
        <GridCell colSpan={12} className={gridStyles.item}>
          <DevicesList />
        </GridCell>
      </Grid>
    </>
  )
}

export default Devices