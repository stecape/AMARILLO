import globalEventEmitter from '../Helpers/globalEventEmitter.js';
import device_api from './db_api/device_api.js'
import field_api from './db_api/field_api.js'
import logic_state_api from './db_api/logic_state_api.js'
import tag_api from './db_api/tag_api.js'
import template_api from './db_api/template_api.js'
import type_api from './db_api/type_api.js'
import um_api from './db_api/um_api.js'
import var_api from './db_api/var_api.js'

export default function (app, pool) {
  device_api(app, pool)
  field_api(app, pool)
  logic_state_api(app, pool)
  tag_api(app, pool)
  template_api(app, pool)
  type_api(app, pool)
  um_api(app, pool)
  var_api(app, pool)

  
  /*
  Execute a query
  Type:   POST
  Route:  '/api/exec'
  Body:   {
            query: 'INSERT INTO "Var" ("id","name","type") VALUES (DEFAULT,'Temperature 2','1')'
          }
  Query:  INSERT INTO "Var" ("id","name","type") VALUES (DEFAULT,'Temperature 2','1')
  Event:  {
            operation: 'INSERT',
            table: 'Var',
            data: { id: 133, type: 1, name: 'Temperature 2' }
          }
  Res:    200
  Err:    400
  */
  app.post('/api/exec', (req, res) => {
    var queryString=req.body.query
    console.log(queryString)
    pool.query({
      text: queryString,
      rowMode: 'array'
    })
    .then(data => res.json({result: data, message: "Query executed"}))
    .catch(error => res.status(400).json({code: error.code, detail: error.detail, message: error.detail}))
  })



  /*
  Get all records
  Type:   POST
  Route:  '/api/getAll'
  Body:   { 
            table: 'Var',
            fields: [ 'name', 'type', 'id' ]
          }
  Query:  SELECT "name","type","id" from "Var"
  Event:  -
  Res:    200,
          {
            value: [
              [ 'Temperature 1', 1, 131 ],
              [ 'Temperature 2', 1, 124 ],
              [ 'Temperature 3', 3, 125 ]
            ]
          }
  Err:    400
  */
  app.post('/api/getAll', (req, res) => {
    var queryString=`SELECT ${req.body.fields.join(',')} FROM "${req.body.table}" ORDER BY id ASC`
    //console.log(queryString)
    pool.query({
      text: queryString,
      rowMode: 'array'
    })
    .then(data => res.json({result: data.rows, message: data.rowCount + " record(s) from table \"" + req.body.table + "\" returned correctly"}))
    .catch(error => res.status(400).json({code: error.code, detail: error.detail, message: error.detail}))
  })


}