import { useState, useContext } from "react"
import { Button } from "@react-md/button"
import DeleteVarPopup from "./DeleteVarPopup"
import ModifyVarPopup from "./ModifyVarPopup"
import { DeleteFontIcon, EditFontIcon } from "@react-md/material-icons"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableContainer
} from '@react-md/table'
import {ctxData} from "../../../Helpers/CtxProvider"
import { UpsertTemplateContext } from './UpsertTemplateContext'
import tableStyles from '../../../styles/Table.module.scss'

function VarsList () {
  const ctx = useContext(ctxData)
  const {upsertTemplate, setUpsertTemplate} = useContext(UpsertTemplateContext)
  const [deletePopup, setDeletePopup] = useState({ visible: false, id: 0, name: '' })
  const [modifyVarPopup, setModifyVarPopup] = useState({ visible: false, type: 0, um: 0, logic_state: 0, comment: '', name: '', QRef: undefined })

  const updateVar = (data)=>{
    //we retreive the var to update object from the array of the fileds and his index,
    //we create a mirror object so that we can update it with the new information and then we recreate the full vars 
    //array with the new information
    var varToUpdateIndex = upsertTemplate.vars.findIndex(i => i.QRef === modifyVarPopup.QRef)
    var varToUpdate = upsertTemplate.vars[varToUpdateIndex]
    varToUpdate.name = data.name
    varToUpdate.type = data.type
    varToUpdate.um = data.um
    varToUpdate.logic_state = data.logic_state
    varToUpdate.comment = data.comment
    var vars = upsertTemplate.vars
    vars[varToUpdateIndex] = varToUpdate

    //and then we pass to work on the queries:
    //check if the var has been already modified in this round, to update the query 
    var actualQuery = upsertTemplate.updateQuery.find(i => i.QRef === modifyVarPopup.QRef)
    var newQuery
    if (actualQuery === undefined) {
      //Not present in the update list: the var could be in the insert list (new var) or already in DB (pre existing var)
      //Check if is in the insert list
      actualQuery = upsertTemplate.insertQuery.find(i => i.QRef === modifyVarPopup.QRef)
      if (actualQuery === undefined) {
        //Not present in the insert list: the var was already in DB. We can insert an entry in the update list
        setUpsertTemplate((prevState) => ({
          ...prevState,
          updateQuery: [
            ...upsertTemplate.updateQuery, 
            {query: `UPDATE "Var" SET name='${data.name}', template=${varToUpdate.template}, type=${data.type}, um=${data.um}, logic_state=${data.logic_state}, comment='${data.comment}' WHERE name = '${modifyVarPopup.name}' AND template = templateId;`, QRef: varToUpdate.QRef}
          ],
          vars: vars
        }), setModifyVarPopup((prevState) => ({ ...prevState, visible: false })))
      } else {
        //the var is in the insert list. The var has been inserted this round, so it is possible to update the insert query
        newQuery = upsertTemplate.insertQuery
        newQuery[newQuery.findIndex(i => i.QRef===varToUpdate.QRef)] = {query: `INSERT INTO "Var" (id, name, template, type, um, logic_state, comment) VALUES (DEFAULT, '${varToUpdate.name}', ${varToUpdate.template}, ${varToUpdate.type}, ${varToUpdate.um}, ${varToUpdate.logic_state}, '${varToUpdate.comment}');`, QRef: varToUpdate.QRef} 
        setUpsertTemplate((prevState) => ({
          ...prevState,
          insertQuery: newQuery,
          vars: vars
        }), setModifyVarPopup((prevState) => ({ ...prevState, visible: false }))) 
    }} else {
      //the var is already in the update list. It is a preexisting var (not in the insert list) that has been already modified this round.
      //It is possible to update the update query
      newQuery = upsertTemplate.updateQuery
      newQuery[newQuery.findIndex(i => i.QRef===varToUpdate.QRef)] = {query: `UPDATE "Var" SET name='${varToUpdate.name}', template=${varToUpdate.template}, type=${varToUpdate.type}, um=${varToUpdate.um}, logic_state=${varToUpdate.logic_state}, comment='${varToUpdate.comment}' WHERE name = '${modifyVarPopup.name}' AND template = templateId;`, QRef: varToUpdate.QRef}
      setUpsertTemplate((prevState) => ({
        ...prevState,
        updateQuery: newQuery,
        vars: vars
      }), setModifyVarPopup((prevState) => ({ ...prevState, visible: false }))) 
    }
  }

  const deleteVar = ()=>{
    //we remove the var from the vars array filtering by !== QRef
    //and then we pass to work on the queries:
    //Check if the var has not been created in this round looking for his QRef in the insertQuery list.
    //If this is the case, it means that we must add the query in the deleteQuery array, to remove it from the DB it is a preexisting var
    //Otherwise we just return the deleteQuery array itself, and filtering the insertQuery array is enough.

    var deleteQuery = upsertTemplate.insertQuery.find(i => i.QRef !== deletePopup.QRef) === undefined ?
      [ ...upsertTemplate.deleteQuery, {query: `DELETE FROM "Var" WHERE name = '${deletePopup.name}' AND template = templateId;`, QRef: deletePopup.QRef} ] :
      upsertTemplate.deleteQuery

    setUpsertTemplate((prevState) => ({
      ...prevState,
      insertQuery: upsertTemplate.insertQuery.filter(i => i.QRef !== deletePopup.QRef),
      updateQuery: upsertTemplate.updateQuery.filter(i => i.QRef !== deletePopup.QRef),
      deleteQuery: deleteQuery,
      vars: upsertTemplate.vars.filter(i => i.QRef !== deletePopup.QRef)
    }))     
    setDeletePopup((prevState) => ({ ...prevState, visible: false }))
  }

  return(
    <>
      <TableContainer>
        <Table fullWidth className={tableStyles.table}>
          <TableHeader>
            <TableRow>
              <TableCell hAlign="left" grow >Name</TableCell>
              <TableCell hAlign="center">Type</TableCell>
              <TableCell hAlign="center">um</TableCell>
              <TableCell hAlign="center">Logic State</TableCell>
              <TableCell hAlign="left">Comment</TableCell>
              <TableCell hAlign="center">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {upsertTemplate.vars.map((item) => {
                var typeItem = ctx.types.find(i => i.id === item.type)
                var umItem = ctx.ums.find(i => i.id === item.um)
                var logic_stateItem = ctx.logicStates.find(i => i.id === item.logic_state)
                return (
                  <TableRow
                    key={item.id}
                  >
                    <TableCell className={tableStyles.cell} hAlign="left">{item.name}</TableCell>
                    <TableCell className={tableStyles.cell}>{typeItem !== undefined ? typeItem.name : item.type}</TableCell>
                    <TableCell className={tableStyles.cell}>{umItem !== undefined && item.um !== 0 && item.um !== null && umItem.name}</TableCell>
                    <TableCell className={tableStyles.cell}>{logic_stateItem !== undefined && item.logic_state !== 0 && item.logic_state !== null && logic_stateItem.name}</TableCell>
                    <TableCell className={tableStyles.cell}>{item.comment !== undefined && item.comment !== '' && item.comment !== null && item.comment}</TableCell>
                    <TableCell className={tableStyles.cell}>
                      <Button
                        id="icon-button-4"
                        buttonType="icon"
                        theme="error"
                        aria-label="Permanently Delete"
                        onClick={() => setDeletePopup({visible: true, name: item.name, QRef: item.QRef})}
                      >
                        <DeleteFontIcon />
                      </Button>
                      <Button
                        id="icon-button-5"
                        buttonType="icon"
                        aria-label="Edit"
                        onClick={() => setModifyVarPopup({visible: true, type: item.type, um: item.um, logic_state: item.logic_state, comment: item.comment, name: item.name, QRef: item.QRef})}
                      >
                        <EditFontIcon />
                      </Button>
                  </TableCell>
                  <TableCell />
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </TableContainer>
      
      <DeleteVarPopup 
        visible={deletePopup.visible}
        name={deletePopup.name}
        delVar={() => deleteVar()}
        cancelCommand={()=>{
          setDeletePopup((prevState) => ({ ...prevState, visible: false }))
        }}
      />
      <ModifyVarPopup 
        visible={modifyVarPopup.visible}
        name={modifyVarPopup.name}
        type={modifyVarPopup.type}
        um={modifyVarPopup.um}
        logic_state={modifyVarPopup.logic_state}
        comment={modifyVarPopup.comment}
        QRef={modifyVarPopup.QRef}
        typesList={upsertTemplate.typesList}
        vars={upsertTemplate.vars}
        updVar={(data) => updateVar(data)}
        cancelCommand={()=>{
          setModifyVarPopup((prevState) => ({ ...prevState, visible: false }))
        }}
      />
    </>
  )}
export default VarsList