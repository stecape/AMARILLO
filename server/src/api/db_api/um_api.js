import globalEventEmitter from '../../Helpers/globalEventEmitter.js';

export default function (app, pool) {

      
  /*
  Add a Um
  Type:   POST
  Route:  '/api/addUm'
  Body:   {
            name: "m_ft",
            metric: "m",
            imperial: "ft",
            gain: 3.28084,
            offset: 0
          }
  Query:
          INSERT INTO "um" (name, metric, imperial, gain, "offset") VALUES ('m_ft', 'm', 'ft', 3.28084, 0);
  */

  app.post('/api/addUm', (req, res) => {
    var queryString = `INSERT INTO "um" (id, name, metric, imperial, gain, "offset") VALUES (DEFAULT,'${req.body.name}','${req.body.metric}','${req.body.imperial}',${req.body.gain},${req.body.offset})`
    pool.query({
      text: queryString,
      rowMode: 'array'
    })
    .then(data => { res.json({result: data.rows[0], message: "Um inserted"}) })
    .catch(error => res.status(400).json({code: error.code, detail: error.detail, message: error.detail}))
  })


  /*
  Modify a Um
  Type:   POST
  Route:  '/api/modifyUm'
  Body:   {
            id: 1,
            name: "m_ft",
            metric: "m",
            imperial: "ft",
            gain: 3.28084,
            offset: 0
          }
  Query:
          UPDATE "um" SET (name = "m_ft", metric = "m", imperial = "ft", gain = 3.28084, "offset" = 0) WHERE id = 1;
  */      

  app.post('/api/modifyUm', (req, res) => {
    var queryString = `UPDATE "um" SET name='${req.body.name}', metric='${req.body.metric}', imperial='${req.body.imperial}', gain=${req.body.gain}, "offset"=${req.body.offset} WHERE id = ${req.body.id}`
    //console.log(queryString)
    pool.query({
      text: queryString,
      rowMode: 'array'
    })
    .then(data => { res.json({result: data.rows[0], message: "Um updated"}) })
    .catch(error => res.status(400).json({code: error.code, detail: error.detail, message: error.detail}))
  })


  /*
  Delete a um
  Type:   POST
  Route:  '/api/removeUm'
  Body:   { id: 126 }
  Query:  DELETE FROM "um" WHERE "id" = 126
  Event:  {
            operation: 'DELETE',
            table: 'um',
            data: { id: 126, name: 'm_ft' .... }
          }
  Res:    200
  Err:    400
  */
  app.post('/api/removeUm', (req, res) => {
    var queryString=`DELETE FROM "um" WHERE id = ${req.body.id};`
    pool.query({
      text: queryString,
      rowMode: 'array'
    })
    .then(data=>{
      res.json({result: data.rows, message: "Record correctly removed from table \"" + req.body.table + "\" "})
    })
    .catch(error => res.status(400).json({code: error.code, detail: error.detail, message: error.detail}))
  })
        

}