import { useState, useContext } from "react"
import { Button } from "@react-md/button"
import DeleteFieldPopup from "./DeleteFieldPopup"
import ModifyFieldPopup from "./ModifyFieldPopup"
import { DeleteSVGIcon, EditSVGIcon } from "@react-md/material-icons"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@react-md/table'
import tableStyles from '../../../styles/Table.module.scss'
import { UpsertTypeContext } from './UpsertTypeContext'

//If a field is already in the DB it has an Id.
//If a field is created in this round, it doesn't have an Id
//So I've introduced a new code, the QRef, which is the reference for the operations
//during an active round:
//the fields are returned from the backend with a QRef number that varies from 0 to the total number of fields (is the index of the map that returns the fields).
//the new fields are created with a QRef that is the Date.now(). This should avoid overlapping.
//The QRef is valid only during the active round, the next round it could change.

function FieldsList () {
  const {upsertType, setUpsertType} = useContext(UpsertTypeContext)
  const [deletePopup, setDeletePopup] = useState({ visible: false, id: 0, name: '' })
  const [modifyFieldPopup, setModifyFieldPopup] = useState({ visible: false, type: 0, um: 0, logic_state: 0, name: '', QRef: undefined })

  const updateField = (data)=>{
    //we retreive the field to update object from the array of the fileds and his index,
    //we create a mirror object so that we can update it with the new information and then we recreate the full fields 
    //array with the new information
    var fieldToUpdateIndex = upsertType.fields.findIndex(i => i.QRef === modifyFieldPopup.QRef)
    var fieldToUpdate = upsertType.fields[fieldToUpdateIndex]
    fieldToUpdate.name = data.name
    fieldToUpdate.type = data.type
    fieldToUpdate.um = data.um
    fieldToUpdate.logic_state = data.logic_state
    var fields = upsertType.fields
    fields[fieldToUpdateIndex] = fieldToUpdate

    //and then we pass to work on the queries:
    //check if the field has been already modified in this round, to update the query 
    var actualQuery = upsertType.updateQuery.find(i => i.QRef === modifyFieldPopup.QRef)
    var newQuery
    if (actualQuery === undefined) {
      //Not present in the update list: the field could be in the insert list (new field) or already in DB (pre existing field)
      //Check if is in the insert list
      actualQuery = upsertType.insertQuery.find(i => i.QRef === modifyFieldPopup.QRef)
      if (actualQuery === undefined) {
        //Not present in the insert list: the field was already in DB. We can insert an entry in the update list
        setUpsertType((prevState) => ({
          ...prevState,
          updateQuery: [
            ...upsertType.updateQuery, 
            {query: `UPDATE "Field" SET name='${data.name}', type=${data.type}, um=${data.um}, logic_state=${data.logic_state} WHERE name = '${modifyFieldPopup.name}' AND parent_type = typeId;`, QRef: fieldToUpdate.QRef}
          ],
          fields: fields
        }), setModifyFieldPopup((prevState) => ({ ...prevState, visible: false })))
      } else {
        //the field is in the insert list. The field has been inserted this round, so it is possible to update the insert query
        newQuery = upsertType.insertQuery
        newQuery[newQuery.findIndex(i => i.QRef===fieldToUpdate.QRef)] = {query: `INSERT INTO "Field" (id, name, type, um, logic_state, parent_type) VALUES (DEFAULT, '${fieldToUpdate.name}', ${fieldToUpdate.type}, ${fieldToUpdate.um}, ${fieldToUpdate.logic_state}, typeId);`, QRef: fieldToUpdate.QRef} 
        setUpsertType((prevState) => ({
          ...prevState,
          insertQuery: newQuery,
          fields: fields
        }), setModifyFieldPopup((prevState) => ({ ...prevState, visible: false }))) 
    }} else {
      //the field is already in the update list. It is a preexisting field (not in the insert list) that has been already modified this round.
      //It is possible to update the update query
      newQuery = upsertType.updateQuery
      newQuery[newQuery.findIndex(i => i.QRef===fieldToUpdate.QRef)] = {query: `UPDATE "Field" SET name='${fieldToUpdate.name}', type=${fieldToUpdate.type}, um=${fieldToUpdate.um}, logic_state=${fieldToUpdate.logic_state} WHERE name = '${modifyFieldPopup.name}' AND parent_type = typeId;`, QRef: fieldToUpdate.QRef}
      setUpsertType((prevState) => ({
        ...prevState,
        updateQuery: newQuery,
        fields: fields
      }), setModifyFieldPopup((prevState) => ({ ...prevState, visible: false }))) 
    }
  }

  const deleteField = ()=>{
    //we remove the field from the fields array filtering by !== QRef
    //and then we pass to work on the queries:
    //Check if the field has not been created in this round looking for his QRef in the insertQuery list.
    //If this is the case, it means that we must add the query in the deleteQuery array, to remove it from the DB it is a preexisting field
    //Otherwise we just return the deleteQuery array itself, and filtering the insertQuery array is enough.

    var deleteQuery = upsertType.insertQuery.find(i => i.QRef !== deletePopup.QRef) === undefined ?
      [ ...upsertType.deleteQuery, {query: `DELETE FROM "Field" WHERE name = '${deletePopup.name}' AND parent_type = typeId;`, QRef: deletePopup.QRef} ] :
      upsertType.deleteQuery

    setUpsertType((prevState) => ({
      ...prevState,
      insertQuery: upsertType.insertQuery.filter(i => i.QRef !== deletePopup.QRef),
      updateQuery: upsertType.updateQuery.filter(i => i.QRef !== deletePopup.QRef),
      deleteQuery: deleteQuery,
      fields: upsertType.fields.filter(i => i.QRef !== deletePopup.QRef)
    }))     
    setDeletePopup((prevState) => ({ ...prevState, visible: false }))
  }

  return(
    <>
      <Table fullWidth className={tableStyles.table}>
        <TableHeader>
          <TableRow>
            <TableCell hAlign="left" grow >Name</TableCell>
            <TableCell hAlign="center">Type</TableCell>
            <TableCell hAlign="center">um</TableCell>
            <TableCell hAlign="center">LogicState</TableCell>
            <TableCell hAlign="center">Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {upsertType.fields.map((item) => {
            console.log(upsertType)
            var typeItem = upsertType.typesList.find(i => i.id === item.type)
            var umItem = upsertType.umList.find(i => i.id === item.um)
            var logic_stateItem = upsertType.logic_stateList.find(i => i.id === item.logic_state)
            console.log(upsertType, umItem, logic_stateItem)
              return (
                <TableRow
                  key={item.QRef}
                >
                  <TableCell className={tableStyles.cell} hAlign="left">{item.name}</TableCell>
                  <TableCell className={tableStyles.cell}>{typeItem !== undefined ? typeItem.name : item.type}</TableCell>
                  <TableCell className={tableStyles.cell}>{item.um !== undefined && item.um !== 0 && umItem.name}</TableCell>
                  <TableCell className={tableStyles.cell}>{item.logic_state !== undefined && item.logic_state !== 0 && logic_stateItem.name}</TableCell>
                  <TableCell className={tableStyles.cell}>
                    <Button
                      id="icon-button-4"
                      buttonType="icon"
                      theme="error"
                      aria-label="Permanently Delete"
                      onClick={() => setDeletePopup({visible: true, name: item.name, QRef: item.QRef})}
                    >
                      <DeleteSVGIcon />
                    </Button>
                    <Button
                      id="icon-button-4"
                      buttonType="icon"
                      aria-label="Edit"
                      onClick={() => setModifyFieldPopup({visible: true, type: item.type, name: item.name, QRef: item.QRef})}
                    >
                      <EditSVGIcon />
                    </Button>
                </TableCell>
                </TableRow>
              )
            })}
        </TableBody>
      </Table>

      <DeleteFieldPopup 
        visible={deletePopup.visible}
        name={deletePopup.name}
        delField={() => deleteField()}
        cancelCommand={()=>{
          setDeletePopup((prevState) => ({ ...prevState, visible: false }))
        }}
      />
      <ModifyFieldPopup 
        visible={modifyFieldPopup.visible}
        name={modifyFieldPopup.name}
        type={modifyFieldPopup.type}
        um={modifyFieldPopup.um}
        logic_state={modifyFieldPopup.logic_state}
        QRef={modifyFieldPopup.QRef}
        typesList={upsertType.typesList}
        umList={upsertType.umList}
        logic_stateList={upsertType.logic_stateList}
        fields={upsertType.fields}
        updField={(data) => updateField(data)}
        cancelCommand={()=>{
          setModifyFieldPopup((prevState) => ({ ...prevState, visible: false }))
        }}
      />
    </>
  )}
export default FieldsList