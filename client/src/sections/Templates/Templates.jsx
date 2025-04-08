import { Grid, GridCell } from '@react-md/utils'
import TemplatesList from './TemplatesList'
import gridStyles from "../../styles/Grid.module.scss"
import { UpsertTemplateContextProvider } from "./UpsertTemplate/UpsertTemplateContext"

function Templates() {
  return (
    <>
      <Grid>
        <GridCell colSpan={12} className={gridStyles.item}>
          <UpsertTemplateContextProvider>
            <TemplatesList />
          </UpsertTemplateContextProvider>
        </GridCell>
      </Grid>
    </>
  )
}

export default Templates