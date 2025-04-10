import globalEventEmitter from '../../Helpers/globalEventEmitter.js';

export default function (app, pool) {

  /*
  Delete a TYPE
  Type:   POST
  Route:  '/api/removeType'
  Body:   { id: 182 }
  Query:  DELETE FROM "TypeDependencies" WHERE "type" = 182; DELETE FROM "Field" WHERE "type" = 182; DELETE FROM "Type" WHERE "id" = 182
  Event:  {
            operation: 'DELETE',
            table: 'Type',
            data: { id: 182, name: 'Prova' }
          }
  Res:    200
  Err:    400
  */
  app.post('/api/removeType', (req, res) => {
    var queryString=`DELETE FROM "Field" WHERE parent_type = ${req.body.id}; DELETE FROM "Type" WHERE id = ${req.body.id}`
    pool.query({
      text: queryString,
      rowMode: 'array'
    })
    .then(data=> res.json({result: data.rows[0], message: "Record correctly removed from table \"" + req.body.table + "\" "}))
    .catch(error => res.status(400).json({code: error.code, detail: error.detail, message: error.detail}))
  })



}