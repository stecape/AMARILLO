import { useContext } from "react"
import { List, ListItem } from "@react-md/list"

import { UpsertTemplateContext } from './UpsertTemplateContext'

function QueryList () {
  const {upsertTemplate} = useContext(UpsertTemplateContext)

  return (
    <List>
      <ListItem key={`templateNameQuery`} id={`templateNameQuery`}>{upsertTemplate.templateNameQuery}</ListItem>
      {upsertTemplate.insertQuery.map((q, i) => (
        <ListItem key={`insertQuery_${i}`} id={`insertQuery_${i}`}>
          {q.query}
        </ListItem>
      ))}
      {upsertTemplate.updateQuery.map((q, i) => (
        <ListItem key={`updateQuery_${i}`} id={`updateQuery_${i}`}>
          {q.query}
        </ListItem>
      ))}
      {upsertTemplate.deleteQuery.map((q, i) => (
        <ListItem key={`deleteQuery_${i}`} id={`deleteQuery_${i}`}>
          {q.query}
        </ListItem>
      ))}
    </List>
  )
}
export default QueryList