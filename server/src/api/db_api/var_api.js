import globalEventEmitter from '../../Helpers/globalEventEmitter.js';

export default function (app, pool) {

  /*
  Add a Var
  Type:   POST
  Route:  '/api/addVar'
  Body:   {
            fields: [ 'name', 'type' ],
            values: [ 'Power', 7 ]      //Type: SetAct
          }
  Query:  
        DO $$ 
          DECLARE
            varId "Var".id%TYPE;
            parentTagId "Tag".id%TYPE;
          BEGIN
            INSERT INTO "Var" (id, name, type) VALUES (DEFAULT, 'Power', 7) RETURNING id into varId;
            INSERT INTO "Tag" (id, name, var, parent_tag, type_field, value) VALUES (DEFAULT, 'Power', varId, NULL, '52', NULL) RETURNING id INTO parentTagId;
        END $$

  */

  app.post('/api/addVar', (req, res) => {
    var typesList, fieldsList;
    var varTemplate = req.body.template;
    var varName = req.body.name;
    var varType = req.body.type;
    var varUm = req.body.um;
    var varLogicState = req.body.logic_state;
    var varComment = req.body.comment;

    // Retreiving the typesList
    var queryString = `SELECT * from "Type"`;
    pool.query({
      text: queryString,
      rowMode: 'array',
    })
      .then(data => {
        typesList = data.rows;
        // Retreiving the fieldsList
        queryString = `SELECT * from "Field"`;
        return pool.query({
          text: queryString,
          rowMode: 'array',
        });
      })
      .then(data => {
        fieldsList = data.rows;
        // Inserting the Var
        queryString = `INSERT INTO "Var" (id, name, template, type, um, logic_state, comment) VALUES (DEFAULT, '${varName}', '${varTemplate}', ${varType}, ${varUm}, ${varLogicState}, '${varComment}') RETURNING "id"`;
        return pool.query({
          text: queryString,
          rowMode: 'array',
        });
      })
      .then(data => {
        res.json({ result: data, message: "Tags refreshed" });
      })
      .catch(error => {
        res.status(400).json({ code: error.code, detail: error.detail, message: error.detail });
      });
  });

  /*
  Modify a Var
  Type:   POST
  Route:  '/api/modifyVar'
  Body:   {
            fields: [ 'name', 'type' ],
            values: [ 'Power', 7 ]      //Type: SetAct
          }
  Query:  
        DO $$ 
          DECLARE
            varId "Var".id%TYPE;
            parentTagId "Tag".id%TYPE;
          BEGIN
            INSERT INTO "Var" (id, name, type) VALUES (DEFAULT, 'Power', 7) RETURNING id into varId;
            INSERT INTO "Tag" (id, name, var, parent_tag, type_field, value) VALUES (DEFAULT, 'Power', varId, NULL, '52', NULL) RETURNING id INTO parentTagId;
        END $$

  */

  app.post('/api/modifyVar', (req, res) => {
    var varId, typesList, fieldsList;
    var varTemplate = req.body.template;
    var varName = req.body.name;
    var varType = req.body.type;
    var varUm = req.body.um;
    var varLogicState = req.body.logic_state;
    var varComment = req.body.comment;

    // Retreiving the typesList
    var queryString = `SELECT * from "Type"`;
    pool.query({
      text: queryString,
      rowMode: 'array',
    })
      .then(data => {
        typesList = data.rows;
        // Retreiving the fieldsList
        queryString = `SELECT * from "Field"`;
        return pool.query({
          text: queryString,
          rowMode: 'array',
        });
      })
      .then(data => {
        fieldsList = data.rows;
        // Updating the Var
        queryString = `UPDATE "Var" SET name = '${varName}', template = '${varTemplate}', type = ${varType}, um = ${varUm}, logic_state = ${varLogicState}, comment = '${varComment}' WHERE id = ${req.body.id}`;
        return pool.query({
          text: queryString,
          rowMode: 'array',
        });
      })
      .then(() => {
        varId = req.body.id;
        return GenerateTags(varId, varName, varType, typesList, fieldsList, varUm, varLogicState, varComment);
      })
      .then(response => {
        res.json({ result: response, message: "Tags refreshed" });
      })
      .catch(error => {
        res.status(400).json({ code: error.code, detail: error.detail, message: error.detail });
      });
  });

  /*
  Delete a var
  Type:   POST
  Route:  '/api/removeVar'
  Body:   { id: 126 }
  Query:  DELETE FROM "Var" WHERE "id" = 126
  Event:  {
            operation: 'DELETE',
            table: 'Var',
            data: { id: 126, type: 1, name: 'Temperature 4' }
          }
  Res:    200
  Err:    400
  */
  app.post('/api/removeVar', (req, res) => {
    var queryString=`DELETE FROM "Var" WHERE id = ${req.body.id};`
    pool.query({
      text: queryString,
      rowMode: 'array'
    })
    .then(data=>{
      res.json({result: data.rows, message: "Record correctly removed from table \"" + req.body.table + "\" "})
    })
    .catch(error => res.status(400).json({code: error.code, detail: error.detail, message: error.detail}))
  });

  /*
  Get all Vars
  Type:   POST
  Route:  '/api/getVars'
  Body:   { template: 1 }
  Query:  SELECT * FROM "Var"
  Res:    200,
          {
            result: [
              { id: 1, name: 'Power', type: 7, template: 'Template1', um: 'kW', logic_state: 'Active', comment: 'Main power variable' },
              ...
            ],
            message: "Vars retrieved successfully"
          }
  Err:    400
  */
  app.post('/api/getVars', (req, res) => {
    let queryString = `SELECT * FROM "Var" WHERE template = ${req.body.template} ORDER BY id`;

    pool.query({
      text: queryString,
      rowMode: 'array',
    })
      .then(data => {
        const vars = data.rows.map((va, i) => ({
          id: va[0],
          type: va[1],
          name: va[2],
          template: va[3],
          um: va[4],
          logic_state: va[5],
          comment: va[6],
          QRef: i,
        }));

        // Recupera il nome del template
        const templateQuery = `SELECT name FROM "Template" WHERE id = ${req.body.template}`;
        return pool.query({
          text: templateQuery,
          rowMode: 'array',
        }).then(templateData => {
          const templateName = templateData.rows[0] ? templateData.rows[0][0] : "Unknown Template";

          // Costruisce l'oggetto di risposta
          const response = {
            name: templateName,
            template: req.body.template,
            vars: vars,
          };

          res.json({ result: response, message: "Vars retrieved successfully" });
        });
      })
      .catch(error => {
        res.status(400).json({ code: error.code, detail: error.detail, message: error.detail });
      });
  });
}